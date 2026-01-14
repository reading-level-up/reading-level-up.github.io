/**
 * ============================================
 * Google Apps Script - 화명 현대 공부방 Form Backend
 * ============================================
 *
 * HOW TO DEPLOY:
 * 1. Go to Google Sheets (https://sheets.google.com)
 * 2. Create a new spreadsheet
 * 3. Add headers in Row 1: Timestamp | Name | Grade | Phone | Datetime | Message
 * 4. Go to Extensions > Apps Script
 * 5. Delete the default code and paste this entire script
 * 6. Save the project (Ctrl+S or Cmd+S)
 * 7. Click "Deploy" > "New deployment"
 * 8. Select type: "Web app"
 * 9. Set "Execute as": "Me"
 * 10. Set "Who has access": "Anyone"
 * 11. Click "Deploy"
 * 12. Copy the Web app URL
 * 13. Paste the URL into index.html where it says YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL
 *
 * IMPORTANT: After any code changes, create a NEW deployment (not edit existing)
 */

// ============================================
// CONFIGURATION - Update these values
// ============================================
const CONFIG = {
  // Email address to receive notifications
  ADMIN_EMAIL: 'your-email@example.com',

  // Sheet name (tab name) where data will be stored
  SHEET_NAME: 'Consultations',

  // Enable/disable email notifications
  SEND_EMAIL: true,

  // Email subject template
  EMAIL_SUBJECT: '[화명 현대 공부방] 새로운 상담 신청',

  // Optional: SMS API configuration (e.g., Twilio, NHN Cloud, etc.)
  // Uncomment and configure if you want SMS notifications
  /*
  SMS_API: {
    ENABLED: false,
    API_URL: 'https://api.your-sms-provider.com/send',
    API_KEY: 'your-api-key',
    SENDER_NUMBER: '+821012345678',
    ADMIN_PHONE: '+821098765432'
  }
  */
};

// ============================================
// MAIN HANDLER - Receives POST requests
// ============================================
function doPost(e) {
  try {
    // Parse incoming JSON data
    const data = JSON.parse(e.postData.contents);

    // Append data to Google Sheet
    const result = appendToSheet(data);

    // Send email notification
    if (CONFIG.SEND_EMAIL) {
      sendEmailNotification(data);
    }

    // Optional: Send SMS notification
    // if (CONFIG.SMS_API && CONFIG.SMS_API.ENABLED) {
    //   sendSmsNotification(data);
    // }

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data saved successfully',
        row: result
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log error for debugging
    console.error('Error in doPost:', error);

    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// HANDLE GET REQUESTS (for testing)
// ============================================
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'OK',
      message: '화명 현대 공부방 Form API is running',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// APPEND DATA TO GOOGLE SHEET
// ============================================
function appendToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    // Add headers
    sheet.appendRow([
      'Timestamp',
      'Name (이름)',
      'Grade (학년)',
      'Phone (연락처)',
      'Preferred Time (희망 시간)',
      'Message (문의사항)'
    ]);
    // Format header row
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#f3f3f3');
  }

  // Format datetime for Korean timezone
  const timestamp = new Date();
  const formattedTimestamp = Utilities.formatDate(
    timestamp,
    'Asia/Seoul',
    'yyyy-MM-dd HH:mm:ss'
  );

  // Format preferred datetime if provided
  let preferredTime = data.datetime || '-';
  if (data.datetime) {
    try {
      const dt = new Date(data.datetime);
      preferredTime = Utilities.formatDate(dt, 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
    } catch (e) {
      preferredTime = data.datetime;
    }
  }

  // Append new row
  const newRow = [
    formattedTimestamp,
    data.name || '-',
    data.grade || '-',
    data.phone || '-',
    preferredTime,
    data.message || '-'
  ];

  sheet.appendRow(newRow);

  // Return the row number
  return sheet.getLastRow();
}

// ============================================
// SEND EMAIL NOTIFICATION
// ============================================
function sendEmailNotification(data) {
  const timestamp = Utilities.formatDate(
    new Date(),
    'Asia/Seoul',
    'yyyy년 MM월 dd일 HH:mm'
  );

  // Format preferred time
  let preferredTime = '미지정';
  if (data.datetime) {
    try {
      const dt = new Date(data.datetime);
      preferredTime = Utilities.formatDate(dt, 'Asia/Seoul', 'yyyy년 MM월 dd일 HH:mm');
    } catch (e) {
      preferredTime = data.datetime;
    }
  }

  // Email body in HTML format
  const htmlBody = `
    <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #FF8C00, #FF0000); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">새로운 상담 신청</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">화명 현대 공부방 x 독서테라피 리드인</p>
      </div>

      <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #eee;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">접수 시간</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${timestamp}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">이름</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #FF8C00; font-weight: bold;">${data.name || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">학년</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${data.grade || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">연락처</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
              <a href="tel:${data.phone}" style="color: #FF0000; text-decoration: none; font-weight: bold;">${data.phone || '-'}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">희망 시간</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${preferredTime}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; vertical-align: top;">문의사항</td>
            <td style="padding: 10px 0; white-space: pre-wrap;">${data.message || '-'}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 20px; padding: 15px; background: #FFFDE7; border-radius: 10px; border-left: 4px solid #FFD700;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          이 이메일은 랜딩페이지에서 자동으로 발송되었습니다.<br/>
          빠른 시일 내에 고객님께 연락드려 주세요.
        </p>
      </div>
    </div>
  `;

  // Plain text version
  const plainBody = `
새로운 상담 신청이 접수되었습니다.

접수 시간: ${timestamp}
이름: ${data.name || '-'}
학년: ${data.grade || '-'}
연락처: ${data.phone || '-'}
희망 시간: ${preferredTime}
문의사항: ${data.message || '-'}

빠른 시일 내에 고객님께 연락드려 주세요.
  `;

  // Send email
  MailApp.sendEmail({
    to: CONFIG.ADMIN_EMAIL,
    subject: CONFIG.EMAIL_SUBJECT,
    body: plainBody,
    htmlBody: htmlBody
  });
}

// ============================================
// SEND SMS NOTIFICATION (Optional)
// ============================================
// Uncomment and configure this function if you want SMS notifications
// You'll need to sign up for an SMS API service like:
// - Twilio (https://www.twilio.com)
// - NHN Cloud (https://www.toast.com/kr/service/notification/sms)
// - Aligo (https://smartsms.aligo.in)
/*
function sendSmsNotification(data) {
  if (!CONFIG.SMS_API || !CONFIG.SMS_API.ENABLED) return;

  const message = `[화명현대공부방] 새 상담신청
이름: ${data.name}
학년: ${data.grade}
연락처: ${data.phone}`;

  // Example for a generic SMS API
  const payload = {
    apiKey: CONFIG.SMS_API.API_KEY,
    sender: CONFIG.SMS_API.SENDER_NUMBER,
    receiver: CONFIG.SMS_API.ADMIN_PHONE,
    message: message
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(CONFIG.SMS_API.API_URL, options);
    console.log('SMS sent:', response.getContentText());
  } catch (error) {
    console.error('SMS error:', error);
  }
}
*/

// ============================================
// TEST FUNCTION - Run this to test the setup
// ============================================
function testSetup() {
  const testData = {
    name: '테스트',
    grade: '초등 저학년',
    phone: '010-1234-5678',
    datetime: new Date().toISOString(),
    message: '테스트 메시지입니다.'
  };

  console.log('Testing sheet append...');
  const row = appendToSheet(testData);
  console.log('Data appended to row:', row);

  if (CONFIG.SEND_EMAIL && CONFIG.ADMIN_EMAIL !== 'your-email@example.com') {
    console.log('Testing email notification...');
    sendEmailNotification(testData);
    console.log('Email sent to:', CONFIG.ADMIN_EMAIL);
  } else {
    console.log('Email test skipped - please configure ADMIN_EMAIL in CONFIG');
  }

  console.log('Test completed successfully!');
}
