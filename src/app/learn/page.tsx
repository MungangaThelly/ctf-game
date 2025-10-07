'use client';

import { useState } from 'react';
import { BookOpen, Shield, Code, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { CATEGORIES } from '@/lib/config';
import { Terminal, CodeBlock, MatrixBackground } from '@/components/ui/hacker-ui';

interface VulnerabilityGuide {
  id: string;
  title: string;
  category: keyof typeof CATEGORIES;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  impact: string[];
  prevention: string[];
  realWorldExamples: string[];
  codeExample: {
    vulnerable: string;
    safe: string;
  };
  owasp: string;
  cwe: string;
}

const vulnerabilityGuides: VulnerabilityGuide[] = [
  {
    id: 'dom-xss',
    title: 'DOM-based Cross-Site Scripting (XSS)',
    category: 'xss',
    severity: 'High',
    description: 'DOM-based XSS occurs when user input is processed by client-side JavaScript and written to the DOM without proper validation or encoding.',
    impact: [
      'Execute arbitrary JavaScript code in victim\'s browser',
      'Steal session cookies and authentication tokens',
      'Perform actions on behalf of the victim',
      'Redirect users to malicious websites',
      'Modify page content to display false information'
    ],
    prevention: [
      'Validate and sanitize all user inputs on both client and server side',
      'Use textContent instead of innerHTML when possible',
      'Implement Content Security Policy (CSP) headers',
      'Encode special characters before inserting into DOM',
      'Use modern frameworks with built-in XSS protection'
    ],
    realWorldExamples: [
      'Facebook Messenger XSS via file upload (2016)',
      'Google Search XSS through URL parameters (2015)',
      'Twitter XSS via tweet composition (2014)',
      'YouTube XSS through video descriptions (2013)'
    ],
    codeExample: {
      vulnerable: `// VULNERABLE - Direct DOM manipulation
const userInput = new URLSearchParams(location.search).get('name');
document.getElementById('welcome').innerHTML = 'Hello ' + userInput;

// VULNERABLE - Using eval with user data
const userData = location.hash.substring(1);
eval(userData);`,
      safe: `// SAFE - Use textContent instead of innerHTML
const userInput = new URLSearchParams(location.search).get('name');
document.getElementById('welcome').textContent = 'Hello ' + userInput;

// SAFE - Validate and sanitize input
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
const safeInput = sanitizeInput(userInput);`
    },
    owasp: 'A03:2021 – Injection',
    cwe: 'CWE-79: Cross-site Scripting'
  },
  {
    id: 'jwt-manipulation',
    title: 'JSON Web Token (JWT) Security Issues',
    category: 'jwt',
    severity: 'Critical',
    description: 'JWT vulnerabilities arise from improper implementation of token validation, weak secrets, or algorithm confusion attacks.',
    impact: [
      'Complete account takeover by forging admin tokens',
      'Privilege escalation to access restricted resources',
      'Bypass authentication mechanisms entirely',
      'Access sensitive user data and system functions',
      'Perform unauthorized transactions or operations'
    ],
    prevention: [
      'Use strong, randomly generated secrets for signing',
      'Always validate the token signature on the server',
      'Explicitly specify and validate the algorithm',
      'Set appropriate expiration times for tokens',
      'Store secrets securely (environment variables, key management)'
    ],
    realWorldExamples: [
      'Auth0 algorithm confusion vulnerability (2015)',
      'Firebase JWT validation bypass (2017)',
      'Zoom JWT token signature bypass (2020)',
      'Multiple OAuth provider JWT issues (2019-2021)'
    ],
    codeExample: {
      vulnerable: `// VULNERABLE - No signature validation
function validateToken(token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp > Date.now() / 1000;
}

// VULNERABLE - Algorithm confusion
jwt.verify(token, secret, { algorithms: ['HS256', 'none'] });`,
      safe: `// SAFE - Proper JWT validation with specific algorithm
const jwt = require('jsonwebtoken');

function validateToken(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']  // Explicitly specify algorithm
    });
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}`
    },
    owasp: 'A02:2021 – Cryptographic Failures',
    cwe: 'CWE-347: Improper Verification of Cryptographic Signature'
  },
  {
    id: 'authorization-bypass',
    title: 'Broken Authorization Controls',
    category: 'auth',
    severity: 'High',
    description: 'Authorization flaws occur when applications fail to properly verify user permissions before granting access to resources or functionality.',
    impact: [
      'Access to admin panels and privileged functions',
      'View or modify other users\' sensitive data',
      'Perform administrative actions without proper rights',
      'Escalate privileges to higher-level accounts',
      'Bypass payment or subscription restrictions'
    ],
    prevention: [
      'Implement server-side authorization checks for all resources',
      'Use role-based access control (RBAC) consistently',
      'Apply principle of least privilege',
      'Validate permissions on every request, not just on login',
      'Avoid relying on client-side security controls'
    ],
    realWorldExamples: [
      'Instagram direct message access bypass (2020)',
      'Shopify partner dashboard privilege escalation (2019)',
      'GitHub private repository access via API (2018)',
      'Uber admin panel access through parameter manipulation (2017)'
    ],
    codeExample: {
      vulnerable: `// VULNERABLE - Client-side role checking only
if (user.role === 'admin') {
  showAdminPanel();
}

// VULNERABLE - No authorization check on API endpoint
app.get('/api/admin/users', (req, res) => {
  const users = db.getAllUsers();
  res.json(users);  // No permission check!
});`,
      safe: `// SAFE - Server-side authorization middleware
function requireAdmin(req, res, next) {
  const user = getUserFromToken(req.headers.authorization);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
}

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = db.getAllUsers();
  res.json(users);
});`
    },
    owasp: 'A01:2021 – Broken Access Control',
    cwe: 'CWE-285: Improper Authorization'
  },
  {
    id: 'open-redirect',
    title: 'Open Redirect Vulnerabilities',
    category: 'redirect',
    severity: 'Medium',
    description: 'Open redirects occur when applications redirect users to URLs specified in untrusted input without proper validation.',
    impact: [
      'Phishing attacks using trusted domain reputation',
      'Bypass of URL whitelists and security filters',
      'Credential theft through convincing fake login pages',
      'Malware distribution via trusted domains',
      'Social engineering attacks leveraging domain trust'
    ],
    prevention: [
      'Validate redirect URLs against a whitelist of allowed domains',
      'Use relative URLs for internal redirects when possible',
      'Implement proper URL parsing and validation',
      'Warn users when redirecting to external domains',
      'Avoid using user input directly in redirect functions'
    ],
    realWorldExamples: [
      'Google OAuth open redirect for phishing (2020)',
      'Microsoft Office 365 redirect vulnerability (2019)',
      'PayPal open redirect in password reset (2018)',
      'GitHub OAuth redirect manipulation (2017)'
    ],
    codeExample: {
      vulnerable: `// VULNERABLE - Direct redirect without validation
app.get('/login', (req, res) => {
  const redirectUrl = req.query.redirect;
  // After login...
  res.redirect(redirectUrl);  // Dangerous!
});

// VULNERABLE - Client-side redirect
const redirect = new URL(location.search).get('redirect');
window.location.href = redirect;`,
      safe: `// SAFE - Validate against whitelist
const ALLOWED_DOMAINS = ['myapp.com', 'api.myapp.com'];

function isValidRedirect(url) {
  try {
    const parsed = new URL(url, 'https://myapp.com');
    return ALLOWED_DOMAINS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

app.get('/login', (req, res) => {
  const redirectUrl = req.query.redirect || '/dashboard';
  if (isValidRedirect(redirectUrl)) {
    res.redirect(redirectUrl);
  } else {
    res.redirect('/dashboard');  // Safe default
  }
});`
    },
    owasp: 'A10:2021 – Server-Side Request Forgery (SSRF)',
    cwe: 'CWE-601: Open Redirect'
  },
  {
    id: 'sandbox-bypass',
    title: 'iframe Sandbox Security Issues',
    category: 'sandbox',
    severity: 'High',
    description: 'Iframe sandbox bypasses occur when sandboxing restrictions are improperly configured, allowing embedded content to escape containment.',
    impact: [
      'Execute JavaScript in the parent window context',
      'Access parent window data and localStorage',
      'Perform actions on behalf of the parent application',
      'Bypass same-origin policy restrictions',
      'Steal sensitive data from the embedding page'
    ],
    prevention: [
      'Use restrictive sandbox attributes (avoid "allow-same-origin" with "allow-scripts")',
      'Implement proper Content Security Policy (CSP)',
      'Validate and sanitize all embedded content',
      'Use postMessage API securely for cross-frame communication',
      'Consider using separate domains for untrusted content'
    ],
    realWorldExamples: [
      'Google Docs iframe sandbox escape (2019)',
      'Microsoft Office Online sandbox bypass (2018)',
      'Adobe Flash Player sandbox escape (2017)',
      'Various browser sandbox bypass CVEs (2016-2020)'
    ],
    codeExample: {
      vulnerable: `<!-- VULNERABLE - Allows script execution and same-origin access -->
<iframe src="untrusted-content.html" 
        sandbox="allow-scripts allow-same-origin">
</iframe>

<!-- VULNERABLE - Too permissive sandbox -->
<iframe src="user-content.html" 
        sandbox="allow-scripts allow-forms allow-popups allow-same-origin">
</iframe>`,
      safe: `<!-- SAFE - Restrictive sandbox (no scripts) -->
<iframe src="untrusted-content.html" 
        sandbox="">
</iframe>

<!-- SAFE - Allow scripts but not same-origin -->
<iframe src="trusted-content.html" 
        sandbox="allow-scripts"
        csp="default-src 'self'">
</iframe>

<!-- SAFE - Separate domain for untrusted content -->
<iframe src="https://sandbox.example.com/content.html" 
        sandbox="allow-scripts">
</iframe>`
    },
    owasp: 'A05:2021 – Security Misconfiguration',
    cwe: 'CWE-264: Permissions, Privileges, and Access Controls'
  }
];

export default function LearnPage() {
  const [selectedGuide, setSelectedGuide] = useState<string>(vulnerabilityGuides[0].id);
  const [showVulnerableCode, setShowVulnerableCode] = useState(true);

  const currentGuide = vulnerabilityGuides.find(g => g.id === selectedGuide);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 border-red-400 bg-red-400/10';
      case 'High': return 'text-orange-400 border-orange-400 bg-orange-400/10';
      case 'Medium': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 'Low': return 'text-green-400 border-green-400 bg-green-400/10';
      default: return 'text-gray-400 border-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen">
      <MatrixBackground density={0.2} speed={0.3} />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <BookOpen className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-3xl font-mono font-bold neon-glow text-green-400">
                Security Knowledge Base
              </h1>
              <p className="text-green-300/80">
                Learn about web security vulnerabilities and how to prevent them
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Vulnerability List */}
          <div className="lg:col-span-1">
            <Terminal title="Vulnerability Types" className="p-0">
              <div className="space-y-2">
                {vulnerabilityGuides.map((guide) => {
                  const category = CATEGORIES[guide.category];
                  const isSelected = selectedGuide === guide.id;
                  
                  return (
                    <button
                      key={guide.id}
                      onClick={() => setSelectedGuide(guide.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-green-400 bg-green-400/10'
                          : 'border-green-400/20 hover:border-green-400/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{category.icon}</span>
                        <span className={`px-2 py-1 rounded text-xs font-mono ${getSeverityColor(guide.severity)}`}>
                          {guide.severity}
                        </span>
                      </div>
                      <div className="font-mono text-sm text-green-300 font-semibold">
                        {guide.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Terminal>
          </div>

          {/* Guide Content */}
          <div className="lg:col-span-3 space-y-6">
            {currentGuide && (
              <>
                {/* Header */}
                <Terminal title={`${CATEGORIES[currentGuide.category].name} Guide`} className="p-0">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-mono font-bold text-green-400 mb-2">
                          {currentGuide.title}
                        </h2>
                        <p className="text-green-300">{currentGuide.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded font-mono text-sm ${getSeverityColor(currentGuide.severity)}`}>
                          {currentGuide.severity} Risk
                        </span>
                        <div className="text-right text-sm text-green-300/60">
                          <div>{currentGuide.owasp}</div>
                          <div>{currentGuide.cwe}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Terminal>

                {/* Impact & Prevention */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Terminal title="Security Impact" className="p-0">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="font-mono text-red-400">Potential Impact</span>
                      </div>
                      {currentGuide.impact.map((impact, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-red-300 text-sm">{impact}</span>
                        </div>
                      ))}
                    </div>
                  </Terminal>

                  <Terminal title="Prevention Methods" className="p-0">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="font-mono text-green-400">Prevention</span>
                      </div>
                      {currentGuide.prevention.map((prevention, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-green-300 text-sm">{prevention}</span>
                        </div>
                      ))}
                    </div>
                  </Terminal>
                </div>

                {/* Code Examples */}
                <Terminal title="Code Examples" className="p-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-mono text-green-400">Implementation Examples</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowVulnerableCode(true)}
                          className={`px-3 py-1 rounded font-mono text-sm transition-colors ${
                            showVulnerableCode
                              ? 'bg-red-400/20 text-red-400 border border-red-400'
                              : 'text-red-300 hover:text-red-400'
                          }`}
                        >
                          Vulnerable
                        </button>
                        <button
                          onClick={() => setShowVulnerableCode(false)}
                          className={`px-3 py-1 rounded font-mono text-sm transition-colors ${
                            !showVulnerableCode
                              ? 'bg-green-400/20 text-green-400 border border-green-400'
                              : 'text-green-300 hover:text-green-400'
                          }`}
                        >
                          Secure
                        </button>
                      </div>
                    </div>

                    <CodeBlock
                      code={showVulnerableCode ? currentGuide.codeExample.vulnerable : currentGuide.codeExample.safe}
                      language="javascript"
                      vulnerable={showVulnerableCode}
                    />
                  </div>
                </Terminal>

                {/* Real-world Examples */}
                <Terminal title="Real-world Cases" className="p-0">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <ExternalLink className="w-5 h-5 text-blue-400" />
                      <span className="font-mono text-blue-400">Notable Security Incidents</span>
                    </div>
                    {currentGuide.realWorldExamples.map((example, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-blue-400/5 border border-blue-400/20 rounded">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-blue-300 text-sm">{example}</span>
                      </div>
                    ))}
                  </div>
                </Terminal>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}