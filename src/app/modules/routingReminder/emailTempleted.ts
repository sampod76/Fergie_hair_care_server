import { IRoutingReminder } from './interface.RoutingReminder';

export const generateReminderEmail = (data: IRoutingReminder) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reminder Notification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                padding: 20px;
                color: #333;
            }
            .container {
                max-width: 600px;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .section {
                margin-bottom: 15px;
            }
            .label {
                font-weight: bold;
                color: #555;
            }
            .footer {
                margin-top: 20px;
                text-align: center;
                font-size: 14px;
                color: #777;
            }
            .button {
                display: inline-block;
                background: #28a745;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">📅 Reminder Notification</div>

            ${
              data.reminderType
                ? `
            <div class="section">
                <span class="label">Log Type:</span> ${data.reminderType}
            </div>
            `
                : ''
            }

            ${
              data.scheduleType
                ? `
            <div class="section">
                <span class="label">Schedule Type:</span> ${data.scheduleType}
            </div>
            `
                : ''
            }

            ${
              data.month
                ? `
            <div class="section">
                <span class="label">Month:</span> ${data.month}
            </div>
            `
                : ''
            }

            ${
              data.daysOfWeek && data.daysOfWeek.length
                ? `
            <div class="section">
                <span class="label">Days of Week:</span> ${data.daysOfWeek.join(', ')}
            </div>
            `
                : ''
            }

            ${
              data.pickDate
                ? `
            <div class="section">
                <span class="label">Pick Date:</span> ${data.pickDate}
            </div>
            `
                : ''
            }

            ${
              data.startTime
                ? `
            <div class="section">
                <span class="label">Start Time:</span> ${data.startTime}
            </div>
            `
                : ''
            }

            ${
              data.endTime
                ? `
            <div class="section">
                <span class="label">End Time:</span> ${data.endTime}
            </div>
            `
                : ''
            }

            ${
              data.productUseDetails
                ? `
            <div class="section">
                <span class="label">Product Used:</span> ${data.productUseDetails}
            </div>
            `
                : ''
            }

            ${
              data.applicationStepsDetails
                ? `
            <div class="section">
                <span class="label">Application Steps:</span> ${data.applicationStepsDetails}
            </div>
            `
                : ''
            }

            ${
              data.images && data.images.length
                ? `
            <div class="section">
                <span class="label">Attached Images:</span>
                <br>
                ${data.images.map(image => `<img src="${image}" alt="Uploaded Image" width="100%" style="border-radius: 5px; margin-top: 5px;">`).join('')}
            </div>
            `
                : ''
            }

            <div class="footer">
                <p>Thank you for using our Reminder App! Stay on top of your schedule. 🎯</p>
              
            </div>
        </div>
    </body>
    </html>
    `;
};
