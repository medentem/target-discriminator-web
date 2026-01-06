"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <CardDescription>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
            <p>
              Medentem LLC ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our web application (the "Service").
            </p>
            <p>
              This application is designed for law enforcement, military, and private citizens to train 
              threat identification skills. By using our Service, you agree to the collection and use of 
              information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">2. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Age Verification Data</h3>
            <p>
              To ensure compliance with age restrictions, we collect and store your birth month and year 
              locally in your browser's localStorage. This information is used solely to verify that you 
              are 18 years or older and is not transmitted to our servers or any third parties.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Training Session Statistics</h3>
            <p>
              We collect and store training session data locally in your browser, including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Session duration and timestamps</li>
              <li>Number of correct and incorrect identifications</li>
              <li>Reaction times</li>
              <li>Media types viewed (videos/photos)</li>
              <li>Threat type classifications</li>
            </ul>
            <p>
              This data is stored locally in your browser's localStorage and is used to track your 
              training progress and performance over time.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.3 User-Uploaded Media</h3>
            <p>
              If you choose to upload custom training media (photos or videos), these files are stored 
              locally in your browser's IndexedDB. This media remains on your device and is not transmitted 
              to our servers or any third parties.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.4 Analytics and Performance Data</h3>
            <p>
              We use Vercel Analytics and Vercel Speed Insights to collect anonymous usage and performance 
              data. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Page views and navigation patterns</li>
              <li>User interactions with the application</li>
              <li>Performance metrics (page load times, Core Web Vitals)</li>
              <li>Error rates and technical issues</li>
              <li>Device and browser information (anonymized)</li>
            </ul>
            <p>
              This data is collected automatically and helps us improve the Service's performance and user 
              experience. Vercel Analytics and Speed Insights are privacy-focused and do not collect 
              personally identifiable information (PII).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>To verify age eligibility for using the Service</li>
              <li>To provide and maintain the training functionality</li>
              <li>To track and display your training progress and statistics</li>
              <li>To improve application performance and user experience</li>
              <li>To diagnose technical issues and errors</li>
              <li>To understand how users interact with the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Storage and Location</h2>
            <p>
              <strong>Local Storage:</strong> Age verification status and session statistics are stored 
              locally in your browser's localStorage. This data remains on your device and can be cleared 
              at any time through your browser settings.
            </p>
            <p>
              <strong>IndexedDB:</strong> User-uploaded media files are stored locally in your browser's 
              IndexedDB. This data remains on your device and is not synchronized with any external servers.
            </p>
            <p>
              <strong>Analytics Data:</strong> Analytics and performance data collected by Vercel Analytics 
              and Speed Insights are processed and stored by Vercel, Inc. This data is stored in accordance 
              with Vercel's privacy policy and data processing agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">5. Third-Party Services</h2>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">5.1 Vercel Analytics</h3>
            <p>
              We use Vercel Analytics, a web analytics service provided by Vercel, Inc. Vercel Analytics 
              collects anonymous usage data to help us understand how users interact with our Service. 
              For more information about Vercel Analytics' data practices, please visit:{" "}
              <a 
                href="https://vercel.com/docs/analytics/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Vercel Analytics Privacy Policy
              </a>
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">5.2 Vercel Speed Insights</h3>
            <p>
              We use Vercel Speed Insights, a performance monitoring service provided by Vercel, Inc. 
              Speed Insights collects anonymous performance metrics to help us optimize the Service's 
              speed and user experience. For more information, please visit:{" "}
              <a 
                href="https://vercel.com/docs/speed-insights/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Vercel Speed Insights Privacy Policy
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information. 
              However, please note that:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Data stored locally in your browser (localStorage, IndexedDB) is subject to your 
                  browser's security settings</li>
              <li>No method of transmission over the Internet or electronic storage is 100% secure</li>
              <li>While we strive to use commercially acceptable means to protect your information, we 
                  cannot guarantee absolute security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">7. Your Rights and Choices</h2>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">7.1 Access and Deletion</h3>
            <p>
              You have the right to access, modify, or delete your locally stored data at any time:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Clear Browser Data:</strong> You can clear all locally stored data through your 
                  browser's settings (localStorage and IndexedDB)</li>
              <li><strong>Session Statistics:</strong> Session statistics are stored locally and can be 
                  cleared by clearing your browser's localStorage</li>
              <li><strong>User Media:</strong> User-uploaded media can be deleted through the Media 
                  Management page or by clearing IndexedDB data</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">7.2 Analytics Opt-Out</h3>
            <p>
              While Vercel Analytics and Speed Insights are designed to be privacy-friendly and do not 
              collect personally identifiable information, you can opt out of analytics tracking by:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Using browser extensions that block analytics scripts</li>
              <li>Configuring your browser's "Do Not Track" setting</li>
              <li>Using privacy-focused browsers or browser settings</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">7.3 GDPR Rights (EU Users)</h3>
            <p>
              If you are located in the European Economic Area (EEA), you have certain data protection 
              rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The right to access your personal data</li>
              <li>The right to rectification of inaccurate data</li>
              <li>The right to erasure ("right to be forgotten")</li>
              <li>The right to restrict processing</li>
              <li>The right to data portability</li>
              <li>The right to object to processing</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in the 
              "Contact Us" section below.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">7.4 CCPA Rights (California Users)</h3>
            <p>
              If you are a California resident, you have certain rights under the California Consumer 
              Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The right to know what personal information is collected</li>
              <li>The right to know if personal information is sold or disclosed</li>
              <li>The right to opt out of the sale of personal information</li>
              <li>The right to non-discrimination for exercising your privacy rights</li>
            </ul>
            <p>
              We do not sell personal information. To exercise your CCPA rights, please contact us using 
              the information provided in the "Contact Us" section below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">8. Children's Privacy</h2>
            <p>
              Our Service is not intended for individuals under the age of 18. We require age verification 
              before allowing access to the Service. We do not knowingly collect personal information from 
              children under 18. If you believe we have collected information from a child under 18, please 
              contact us immediately, and we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">9. Data Retention</h2>
            <p>
              <strong>Local Data:</strong> Data stored locally in your browser (localStorage, IndexedDB) 
              will persist until you clear your browser data or uninstall the application. You can delete 
              this data at any time through your browser settings or the application's interface.
            </p>
            <p>
              <strong>Analytics Data:</strong> Analytics and performance data collected by Vercel are 
              retained according to Vercel's data retention policies. For specific retention periods, 
              please refer to Vercel's privacy documentation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">10. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date at the top 
              of this policy.
            </p>
            <p>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this 
              Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-6 mb-3">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or wish to exercise your privacy rights, 
              please contact us: 
            </p>
            <p className="mt-2">
              <strong>Email:</strong><a href="mailto:support@medentem.com">support@medentem.com</a>
            </p>
          </section>

          <section className="pt-6 border-t">
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}

