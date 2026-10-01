const axios = require('axios');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const File = require('../models/File');
const { logActivity } = require('../utils/activityLogger');

/**
 * Helper to fetch content of a file from URL as text or buffer
 */
async function extractFileText(file) {
  try {
    const isPdf = file.mimetype === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isTextLike =
      file.mimetype.startsWith('text/') ||
      file.mimetype.includes('json') ||
      file.mimetype.includes('javascript') ||
      file.mimetype.includes('xml') ||
      file.name.match(/\.(txt|md|js|jsx|ts|tsx|json|html|css|py|csv|env|yml|yaml|sql)$/i);

    if (isPdf) {
      const response = await axios.get(file.url, { responseType: 'arraybuffer', timeout: 20000 });
      const pdfData = await pdfParse(response.data);
      return pdfData.text || '';
    } else if (isTextLike) {
      const response = await axios.get(file.url, { responseType: 'text', timeout: 15000 });
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    } else if (file.mimetype?.startsWith('image/')) {
      // If OCR text is already saved, use it
      if (file.ocrText && file.ocrText.trim() && !file.ocrText.includes('[No readable text')) {
        return file.ocrText;
      }
      // Otherwise perform OCR on the image
      const imgResponse = await axios.get(file.url, { responseType: 'arraybuffer', timeout: 20000 });
      const { data } = await Tesseract.recognize(Buffer.from(imgResponse.data), 'eng');
      const text = (data?.text || '').trim();
      if (text) {
        file.ocrText = text;
        await file.save().catch(() => {});
        return text;
      }
      return `Image File: ${file.name}, Size: ${(file.size / 1024).toFixed(1)} KB`;
    } else {
      return `File Name: ${file.name}, Size: ${(file.size / 1024).toFixed(1)} KB, Format: ${file.format || file.mimetype}`;
    }
  } catch (err) {
    console.warn('Error extracting file text for AI:', err.message);
    return `File Name: ${file.name}, Type: ${file.mimetype}`;
  }
}

/**
 * Helper to call Pollinations AI Text API (Free, fast, no auth required)
 */
async function callPollinationsAI(messages) {
  // Method 1: POST to https://text.pollinations.ai/ with messages array (Free public cluster)
  try {
    const response = await axios.post(
      'https://text.pollinations.ai/',
      {
        messages,
        seed: Math.floor(Math.random() * 1000000)
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 25000
      }
    );

    if (response.data) {
      const text = typeof response.data === 'string' ? response.data : response.data.choices?.[0]?.message?.content || JSON.stringify(response.data);
      if (text && text.trim()) return text.trim();
    }
  } catch (err) {
    console.warn('Pollinations JSON endpoint warning:', err.response?.status || err.message);
  }

  // Method 2: POST plain text prompt fallback
  try {
    const combinedPrompt = messages
      .map((m) => `${m.role.toUpperCase()}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`)
      .join('\n\n');

    const response = await axios.post(
      'https://text.pollinations.ai/',
      combinedPrompt,
      {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 25000
      }
    );

    if (response.data) {
      return typeof response.data === 'string' ? response.data.trim() : JSON.stringify(response.data);
    }
  } catch (err2) {
    console.warn('Pollinations raw text fallback failed:', err2.message);
  }

  // Method 3: GET endpoint fallback
  try {
    const userMsg = messages[messages.length - 1]?.content || 'Hello';
    const cleanPrompt = encodeURIComponent(String(userMsg).substring(0, 800));
    const getRes = await axios.get(`https://text.pollinations.ai/${cleanPrompt}`, { timeout: 20000 });
    if (getRes.data) {
      return typeof getRes.data === 'string' ? getRes.data.trim() : JSON.stringify(getRes.data);
    }
  } catch (err3) {
    console.error('All Pollinations AI attempts failed:', err3.message);
    throw new Error('AI service is temporarily busy. Please try again in a few seconds.');
  }
}

/**
 * @desc Summarize a document or file using Pollinations AI
 * @route POST /api/ai/summarize
 */
exports.summarizeDocument = async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return res.status(400).json({ success: false, message: 'File ID is required' });
    }

    const file = await File.findOne({ _id: fileId, owner: req.user._id, isTrashed: false });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Extract text content
    let extractedText = await extractFileText(file);
    if (extractedText.length > 20000) {
      extractedText = extractedText.substring(0, 20000) + '\n...[Content truncated for analysis]';
    }

    const systemPrompt = `You are AuraDrive's advanced AI Document Analyst. Your job is to provide high-quality, structured executive summaries of files.
Format your output cleanly in Markdown with the following sections:
- **📌 Executive Summary**: 2-3 concise sentences summarizing the core message or purpose.
- **✨ Key Takeaways / Highlights**: 4-6 bullet points covering the most important facts, data, or action items.
- **🏷️ Key Topics & Tags**: 3-5 relevant thematic hashtags.
- **⏱️ Estimated Reading Time**: e.g., "2 min read".

If the document is code, explain its architecture and core functions. Be clear and helpful.`;

    const userPrompt = `Please summarize the following file:
File Name: "${file.name}"
Type: ${file.mimetype}
File Content:
\`\`\`
${extractedText}
\`\`\``;

    const summary = await callPollinationsAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    // Save summary in file document for fast caching & full-text indexing
    file.aiSummary = summary;
    await file.save();

    await logActivity({
      userId: req.user._id,
      action: 'ai_summary',
      itemType: 'file',
      itemId: file._id,
      itemName: file.name,
      details: { summaryLength: summary.length }
    });

    return res.status(200).json({
      success: true,
      summary,
      fileName: file.name,
      mimetype: file.mimetype
    });
  } catch (err) {
    console.error('AI Summarize Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate AI summary'
    });
  }
};

/**
 * @desc Chat with Document / Ask questions about a file
 * @route POST /api/ai/chat
 */
exports.chatWithDocument = async (req, res) => {
  try {
    const { fileId, messages, question } = req.body;
    if (!fileId) {
      return res.status(400).json({ success: false, message: 'File ID is required' });
    }

    const file = await File.findOne({ _id: fileId, owner: req.user._id, isTrashed: false });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    let extractedText = await extractFileText(file);
    if (extractedText.length > 20000) {
      extractedText = extractedText.substring(0, 20000) + '\n...[Content truncated for analysis]';
    }

    const systemPrompt = `You are AuraDrive's intelligent file assistant. Answer the user's questions about the file "${file.name}".
File Content:
\`\`\`
${extractedText}
\`\`\`

Answer accurately based on this content. Format your response cleanly with Markdown.`;

    const conversation = [{ role: 'system', content: systemPrompt }];

    if (Array.isArray(messages) && messages.length > 0) {
      messages.forEach((msg) => {
        if (msg.role && msg.content) {
          conversation.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.content });
        }
      });
    } else if (question) {
      conversation.push({ role: 'user', content: question });
    } else {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const reply = await callPollinationsAI(conversation);

    return res.status(200).json({
      success: true,
      reply
    });
  } catch (err) {
    console.error('AI Chat Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to chat with document'
    });
  }
};

/**
 * @desc Extract text / OCR from Image using high-performance Tesseract Engine
 * @route POST /api/ai/ocr
 */
exports.ocrImage = async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return res.status(400).json({ success: false, message: 'File ID is required' });
    }

    const file = await File.findOne({ _id: fileId, owner: req.user._id, isTrashed: false });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, message: 'File is not an image' });
    }

    // Download image buffer for local OCR processing
    const imgResponse = await axios.get(file.url, {
      responseType: 'arraybuffer',
      timeout: 25000
    });

    const imageBuffer = Buffer.from(imgResponse.data);

    // Run Tesseract OCR on image buffer
    const { data } = await Tesseract.recognize(imageBuffer, 'eng');
    const rawOcrText = (data?.text || '').trim();

    const formattedText = rawOcrText
      ? rawOcrText
      : `[No readable text, characters, or receipt data detected in this image.]\nImage: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`;

    // Save OCR text in file document for global full-text search indexing
    file.ocrText = formattedText;
    await file.save();

    await logActivity({
      userId: req.user._id,
      action: 'ai_ocr',
      itemType: 'file',
      itemId: file._id,
      itemName: file.name,
      details: { charactersExtracted: rawOcrText.length }
    });

    return res.status(200).json({
      success: true,
      ocrText: formattedText,
      fileName: file.name
    });
  } catch (err) {
    console.error('AI OCR Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to extract text from image'
    });
  }
};
