import { ContentSection } from '@/components/sections';

export default function CookiePolicyPage() {
  return (
    <ContentSection title="Cookie Policy">
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <h2>1. What Are Cookies</h2>
        <p>
          Cookies are small text files that are placed on your computer or mobile device when you visit a website.
          They are widely used to make websites work more efficiently and provide information to the owners of the site.
        </p>

        <h2>2. How We Use Cookies</h2>
        <p>greensmil.com uses cookies for the following purposes:</p>

        <h3>2.1 Essential Cookies</h3>
        <p>
          These cookies are necessary for the website to function properly. They enable core functionality such as security,
          network management, and accessibility. You may disable these by changing your browser settings, but this may affect
          how the website functions.
        </p>

        <h3>2.2 Analytics Cookies</h3>
        <p>
          These cookies allow us to recognize and count the number of visitors and see how visitors move around our website.
          This helps us improve the way our website works, for example, by ensuring that users can find what they are looking for easily.
        </p>

        <h3>2.3 Functionality Cookies</h3>
        <p>
          These cookies are used to recognize you when you return to our website. This enables us to personalize our content for you,
          greet you by name, and remember your preferences (for example, your choice of language or region).
        </p>

        <h3>2.4 Preference Cookies</h3>
        <p>
          These cookies enable the website to remember information that changes the way the website behaves or looks,
          such as your preferred language or the region you are in.
        </p>

        <h2>3. Types of Cookies We Use</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-left">Cookie Name</th>
                <th className="border border-border p-2 text-left">Purpose</th>
                <th className="border border-border p-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-2">cookie_consent</td>
                <td className="border border-border p-2">Stores your cookie consent preferences</td>
                <td className="border border-border p-2">1 year</td>
              </tr>
              <tr>
                <td className="border border-border p-2">session_id</td>
                <td className="border border-border p-2">Maintains your session state</td>
                <td className="border border-border p-2">Session</td>
              </tr>
              <tr>
                <td className="border border-border p-2">_ga</td>
                <td className="border border-border p-2">Google Analytics - distinguishes users</td>
                <td className="border border-border p-2">2 years</td>
              </tr>
              <tr>
                <td className="border border-border p-2">_gid</td>
                <td className="border border-border p-2">Google Analytics - distinguishes users</td>
                <td className="border border-border p-2">24 hours</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>4. Third-Party Cookies</h2>
        <p>
          In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the website
          and deliver advertisements on and through the website. These third parties may include:
        </p>
        <ul>
          <li><strong>Google Analytics:</strong> We use Google Analytics to analyze the use of our website.</li>
          <li><strong>Social Media Platforms:</strong> We may use cookies from social media platforms for sharing content.</li>
        </ul>

        <h2>5. How to Control Cookies</h2>
        <p>
          You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer
          and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually
          adjust some preferences every time you visit our site and some services and functionalities may not work.
        </p>

        <h3>Browser Controls</h3>
        <ul>
          <li><strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and other site data</li>
          <li><strong>Firefox:</strong> Settings &gt; Privacy & Security &gt; Cookies and Site Data</li>
          <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies and website data</li>
          <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions &gt; Cookies and site data</li>
        </ul>

        <h2>6. Cookie Consent</h2>
        <p>
          When you first visit greensmil.com, you will be asked to consent to our use of cookies. You can withdraw or change
          your consent at any time by clicking on the cookie preferences link in the footer of our website.
        </p>

        <h2>7. Updates to This Cookie Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for other operational,
          legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies.
        </p>

        <h2>8. Contact Us</h2>
        <p>
          If you have any questions about our use of cookies, please contact us:
        </p>
        <ul>
          <li>By email: <a href="mailto:smilenlyubenov@gmail.com" className="text-primary hover:underline">smilenlyubenov@gmail.com</a></li>
          <li>By visiting this page on our website: <a href="https://greensmil.com" className="text-primary hover:underline">greensmil.com</a></li>
        </ul>
      </div>
    </ContentSection>
  );
}
