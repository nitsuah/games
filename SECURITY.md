# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it by emailing the maintainers directly at TODO: SECURITY_CONTACT_EMAIL. You can expect:

1. **Acknowledgment**: We'll acknowledge receipt of your vulnerability report within 48 hours.
2. **Updates**: We'll send you regular updates about our progress.
3. **Disclosure**: We'll notify you when the vulnerability is fixed.
4. **Credit**: We'll credit you in the release notes (unless you prefer to remain anonymous).

### What to Include

When reporting a vulnerability, please include:

- Type of issue (e.g., XSS, injection, etc.)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Potential impact of the issue

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity; critical issues are prioritized. We will provide an estimated fix timeline after assessing the vulnerability.

## Security Best Practices

When contributing to this project:

- Keep dependencies up to date using `npm update`.
- Follow secure coding practices for JavaScript. Refer to OWASP guidelines.
- Use environment variables for sensitive data.
- Never commit API keys, passwords, or tokens.
- Review code changes for security implications before submitting a pull request.

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions.
2. Audit the codebase to find any similar problems.
3. Prepare fixes for all supported versions.
4. Release new versions as soon as possible, providing a security advisory with details about the vulnerability and its fix.