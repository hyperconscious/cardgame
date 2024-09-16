exports.showMessage = (req, res) => {
    const { type, message, previewUrl } = req.query;
    const messageType = type === 'success' ? 'Success' : 'Error';
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${messageType}</title>
            <style>
              body {
                background: linear-gradient(135deg, rgba(40, 10, 80, 0.8), rgba(60, 20, 120, 0.8));
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                color: #f0f0f0;
              }

              .message-container {
                background-color: #1e1e1e;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
                width: 100%;
                max-width: 500px;
                text-align: center;
              }

              h2 {
                color: ${type === 'success' ? '#d4edda' : '#f8d7da'};
              }

              p {
                color: ${type === 'success' ? '#155724' : '#721c24'};
              }

              a {
                display: inline-block;
                padding: 10px 20px;
                color: white;
                background-color: #007bff;
                text-decoration: none;
                border-radius: 4px;
                margin-top: 20px;
              }

              a:hover {
                background-color: #0056b3;
              }
            </style>
        </head>
        <body>
            <div class="message-container">
                <h2>${messageType}</h2>
                <p>${decodeURIComponent(message)}</p>
                ${previewUrl ? `<p><a href="${previewUrl}" target="_blank">View Email Preview</a></p>` : ''}
                <a href="/">Go to Login</a>
            </div>
        </body>
        </html>
    `);
};