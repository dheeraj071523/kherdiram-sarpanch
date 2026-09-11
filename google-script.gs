/**
 * ============================================================
 * Google Apps Script - ग्राम पंचायत खेड़ीराम Campaign
 * Receives grievance/suggestion form submissions from index.html
 * and stores them as rows in a Google Sheet. 100% free.
 *
 * SETUP (see hosting guide at bottom of chat for full steps):
 * 1. Create a Google Sheet, open Extensions > Apps Script.
 * 2. Paste this entire file, replacing any starter code.
 * 3. Run setupSheet() once from the Apps Script editor to create headers.
 * 4. Deploy > New deployment > Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy the Web App URL and paste it into GOOGLE_SCRIPT_URL in index.html.
 * ============================================================
 */

const SHEET_NAME = "Campaign Support"; // Tab name where entries are stored

/**
 * Run this once manually from the Apps Script editor
 * to create the sheet tab and header row.
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  const headers = ["Timestamp", "Full Name", "Phone", "Ward Number", "Support Type", "Message", "Submitted At (Server)"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Handles POST requests sent via fetch() from index.html
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["Timestamp", "Full Name", "Phone", "Ward Number", "Support Type", "Message", "Submitted At (Server)"]);
    }

    let data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    const fullName = sanitize(data.fullName);
    const phone = sanitize(data.phone);
    const ward = sanitize(data.ward);
    const supportType = sanitize(data.supportType);
    const message = sanitize(data.message);
    const clientTimestamp = sanitize(data.timestamp);

    if (!fullName || !phone) {
      return jsonResponse({ status: "error", message: "Missing required fields" });
    }

    sheet.appendRow([
      clientTimestamp || new Date().toISOString(),
      fullName,
      phone,
      ward,
      supportType,
      message,
      new Date()
    ]);

    return jsonResponse({ status: "success" });
  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * Simple GET handler so visiting the Web App URL directly
 * shows a friendly message instead of an error.
 */
function doGet() {
  return ContentService
    .createTextOutput("ग्राम पंचायत खेड़ीराम फॉर्म बैकएंड सक्रिय है। ✅")
    .setMimeType(ContentService.MimeType.TEXT);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Basic sanitation: trims whitespace and strips characters
 * that could break sheet formulas (e.g. a leading "=").
 */
function sanitize(value) {
  if (value === undefined || value === null) return "";
  let str = String(value).trim();
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str; // neutralize potential formula injection
  }
  return str;
}