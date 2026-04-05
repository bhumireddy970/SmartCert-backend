export const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
    }
    .wrapper {
      width: 100%;
      background-color: #f3f4f6;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #4f46e5;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #111827;
      font-size: 20px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 20px;
    }
    .box {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 20px;
      margin: 24px 0;
    }
    .btn {
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 500;
      margin-top: 10px;
      text-align: center;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 0;
      color: #9ca3af;
      font-size: 14px;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      background-color: #e0e7ff;
      color: #4338ca;
    }
    .badge-error {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    .badge-success {
      background-color: #d1fae5;
      color: #047857;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="container" cellspacing="0" cellpadding="0">
      <tr>
        <td class="header">
          <h1>SmartCert</h1>
        </td>
      </tr>
      <tr>
        <td class="content">
          ${content}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>&copy; ${new Date().getFullYear()} SmartCert Platform. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;
export const getApplicationSubmittedTemplate = (userName, certName, status) => {
  const content = `
    <h2>Application Received</h2>
    <p>Hello <strong>${userName}</strong>,</p>
    <p>Your application for <strong>${certName}</strong> has been securely submitted to the SmartCert platform.</p>
    <div class="box">
      <p style="margin-bottom: 8px; font-size: 14px; color: #6b7280;">Current Status</p>
      <div class="badge">${status}</div>
    </div>
    <p>You can track the progress of your application at any time by logging into your portal.</p>
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/applications" class="btn">View Application</a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate(content);
};
export const getDocumentReuploadedTemplate = (userName, docName, status) => {
  const content = `
    <h2>Document Re-uploaded</h2>
    <p>Hello <strong>${userName}</strong>,</p>
    <p>We've successfully received your re-uploaded document: <strong>${docName}</strong>.</p>
    <div class="box">
      <p style="margin-bottom: 8px; font-size: 14px; color: #6b7280;">Application Status</p>
      <div class="badge">${status}</div>
    </div>
    <p>The document is now pending review by an authorized officer. We will notify you once an action is taken.</p>
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/applications" class="btn">Check Portal</a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate(content);
};
export const getGeneralUpdateTemplate = (userName, notifyMsg, newStatus) => {
  let badgeClass = 'badge';
  const lowerStatus = newStatus.toLowerCase();
  if (lowerStatus.includes('rejected')) badgeClass += ' badge-error';
  if (lowerStatus.includes('ready') || lowerStatus.includes('approved')) badgeClass += ' badge-success';
  if (lowerStatus.includes('information')) badgeClass += ' badge-error';
  const content = `
    <h2>Application Update</h2>
    <p>Hello <strong>${userName}</strong>,</p>
    <p>There has been an update regarding your SmartCert application.</p>
    <div class="box" style="border-left: 4px solid #4f46e5;">
      <p style="margin-top: 0; margin-bottom: 0;">${notifyMsg}</p>
    </div>
    <div class="box" style="margin-top: 10px;">
      <p style="margin-bottom: 8px; font-size: 14px; color: #6b7280;">Current Status</p>
      <div class="${badgeClass}">${newStatus}</div>
    </div>
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/applications" class="btn">View Details</a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate(content);
};
export const getActionRequiredTemplate = (userName, docName, feedback) => {
  const content = `
    <h2>Action Required: Document Rejected</h2>
    <p>Hello <strong>${userName}</strong>,</p>
    <p>Your uploaded document <strong>${docName}</strong> requires your immediate attention.</p>
    <div class="box" style="border-left: 4px solid #ef4444; background-color: #fef2f2;">
      <p style="margin-top: 0; margin-bottom: 8px; font-size: 14px; color: #b91c1c; font-weight: 600;">Officer Feedback</p>
      <p style="margin-bottom: 0; color: #991b1b;">${feedback}</p>
    </div>
    <p>Please log in to your portal to review the feedback and re-upload the correct document to resume your application process.</p>
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/applications" class="btn">Update Document</a>
        </td>
      </tr>
    </table>
  `;
  return baseTemplate(content);
};
