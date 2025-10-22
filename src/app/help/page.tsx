
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function HelpPage() {
  const faqs = [
    {
      question: 'How do I add a new income source?',
      answer: 'On the main dashboard, click the "Add Income" button in the Income section. A new row will appear where you can enter the name and amount of the income source.',
    },
    {
      question: 'How does the 50/40/10 budget rule work?',
      answer: 'This rule automatically allocates 50% of your total income to Needs, 40% to Investments, and 10% to Wants. You can customize these percentages by clicking the "Customize Budget" button.',
    },
    {
      question: 'How do I join a family group?',
      answer: 'During sign-up, you can enter a Family Group Code to join an existing group. If you are already signed up, you can add or change your family group from your Profile page.',
    },
    {
        question: 'Can I download my financial reports?',
        answer: 'Yes, downloading reports in PDF and CSV format is a premium feature available to Pro plan subscribers. You can upgrade from the Subscription page.'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Help & FAQ</CardTitle>
          <CardDescription>Find answers to frequently asked questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
