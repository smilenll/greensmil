import { ContentSection } from '@/components/sections';

export default function PrivacyPage() {
  return (
    <ContentSection title="Privacy Policy">
      <div className="prose prose-sm max-w-none">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to greensmil.com (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We respect your privacy and are committed to protecting your personal data.
          This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.
        </p>

        <h2>2. Information We Collect</h2>
        <p>We may collect, use, store and transfer different kinds of personal data about you:</p>
        <ul>
          <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
          <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform.</li>
          <li><strong>Usage Data:</strong> includes information about how you use our website and services.</li>
          <li><strong>Marketing and Communications Data:</strong> includes your preferences in receiving marketing from us.</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul>
          <li>To provide and maintain our services</li>
          <li>To notify you about changes to our services</li>
          <li>To provide customer support</li>
          <li>To gather analysis or valuable information so that we can improve our services</li>
          <li>To monitor the usage of our services</li>
          <li>To detect, prevent and address technical issues</li>
        </ul>

        <h2>4. Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar tracking technologies to track the activity on our website and hold certain information.
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          For more information, please see our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
        </p>

        <h2>5. Data Security</h2>
        <p>
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way,
          altered or disclosed. We limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
        </p>

        <h2>6. Data Retention</h2>
        <p>
          We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of
          satisfying any legal, accounting, or reporting requirements.
        </p>

        <h2>7. Your Legal Rights</h2>
        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
        <ul>
          <li>Request access to your personal data</li>
          <li>Request correction of your personal data</li>
          <li>Request erasure of your personal data</li>
          <li>Object to processing of your personal data</li>
          <li>Request restriction of processing your personal data</li>
          <li>Request transfer of your personal data</li>
          <li>Right to withdraw consent</li>
        </ul>

        <h2>8. Third-Party Links</h2>
        <p>
          This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections
          may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <ul>
          <li>By email: <a href="mailto:smilenlyubenov@gmail.com" className="text-primary hover:underline">smilenlyubenov@gmail.com</a></li>
          <li>By visiting this page on our website: <a href="https://greensmil.com" className="text-primary hover:underline">greensmil.com</a></li>
        </ul>

        <h2>10. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page
          and updating the &quot;Last updated&quot; date at the top of this Privacy Policy.
        </p>
      </div>
    </ContentSection>
  );
}
