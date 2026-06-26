<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
    xmlns:html="http://www.w3.org/TR/REC-html40"
    xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    
    <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
    
    <xsl:template match="/">
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
        <head>
            <title>XML Sitemap — AgriGrant AI</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet" />
            <style type="text/css">
                :root {
                    --bg-color: #0c110a;
                    --panel-bg: #131c11;
                    --primary: #10b981;
                    --primary-hover: #059669;
                    --text-main: #f3f4f6;
                    --text-muted: #9ca3af;
                    --border: #22321f;
                    --font-family: 'Plus Jakarta Sans', sans-serif;
                }

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                body {
                    background-color: var(--bg-color);
                    color: var(--text-main);
                    font-family: var(--font-family);
                    padding: 40px 20px;
                    line-height: 1.6;
                }

                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    background: linear-gradient(135deg, var(--panel-bg), #1c2e1a);
                    padding: 40px;
                    border-radius: 20px;
                    border: 1px solid var(--border);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                }

                .logo {
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--text-main);
                    margin-bottom: 12px;
                    letter-spacing: -0.5px;
                }

                .logo span {
                    color: var(--primary);
                }

                .subtitle {
                    color: var(--text-muted);
                    font-size: 15px;
                    margin-bottom: 20px;
                }

                .stats {
                    display: inline-flex;
                    gap: 30px;
                    background: rgba(0,0,0,0.25);
                    padding: 12px 30px;
                    border-radius: 50px;
                    border: 1px solid var(--border);
                }

                .stat-item {
                    font-size: 14px;
                    color: var(--text-muted);
                }

                .stat-item strong {
                    color: var(--primary);
                    font-size: 16px;
                }

                .table-container {
                    background-color: var(--panel-bg);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }

                th {
                    background-color: rgba(0, 0, 0, 0.2);
                    padding: 18px 24px;
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    color: var(--primary);
                    border-bottom: 1px solid var(--border);
                }

                td {
                    padding: 18px 24px;
                    font-size: 14px;
                    color: var(--text-main);
                    border-bottom: 1px solid var(--border);
                    word-break: break-all;
                }

                tr:last-child td {
                    border-bottom: none;
                }

                tr:hover td {
                    background-color: rgba(255, 255, 255, 0.02);
                }

                a {
                    color: var(--text-main);
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.2s ease;
                }

                a:hover {
                    color: var(--primary);
                }

                .priority-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--primary);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .freq-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-muted);
                }

                .footer {
                    text-align: center;
                    margin-top: 40px;
                    color: var(--text-muted);
                    font-size: 13px;
                }

                .footer a {
                    color: var(--primary);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">AgriGrant <span>AI</span></div>
                    <div class="subtitle">XML Sitemap generated for search engines like Google, Bing, and Yahoo.</div>
                    <div class="stats">
                        <div class="stat-item">Total URLs: <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong></div>
                        <div class="stat-item">Platform: <strong>Next.js App</strong></div>
                    </div>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 55%;">URL Path</th>
                                <th style="width: 15%; text-align: center;">Priority</th>
                                <th style="width: 15%; text-align: center;">Frequency</th>
                                <th style="width: 15%;">Last Modified</th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="sitemap:urlset/sitemap:url">
                                <tr>
                                    <td>
                                        <a href="{sitemap:loc}" target="_blank">
                                            <xsl:value-of select="sitemap:loc"/>
                                        </a>
                                    </td>
                                    <td style="text-align: center;">
                                        <span class="priority-badge">
                                            <xsl:value-of select="sitemap:priority"/>
                                        </span>
                                    </td>
                                    <td style="text-align: center;">
                                        <span class="freq-badge">
                                            <xsl:value-of select="sitemap:changefreq"/>
                                        </span>
                                    </td>
                                    <td>
                                        <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                                    </td>
                                </tr>
                            </xsl:for-each>
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p>Generated by <a href="https://www.agrigrant.xyz">AgriGrant AI</a>. Learn more about <a href="https://www.sitemaps.org" target="_blank" rel="noopener noreferrer">Sitemaps.org</a>.</p>
                </div>
            </div>
        </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
