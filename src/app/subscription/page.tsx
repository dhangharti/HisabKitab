
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Download } from 'lucide-react';

export default function SubscriptionPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription plan and billing details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Your current plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-primary" />10 Income Entries</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-primary" />1 Loan Entry</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-primary" />Basic Budgeting</li>
              </ul>
              <Button disabled className="w-full">
                Currently Active
              </Button>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Pro Plan</CardTitle>
              <CardDescription>Unlock all features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">$10<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-primary" />Unlimited Income Entries</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-primary" />Unlimited Loan Entries</li>
                <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-primary" />Advanced Budgeting</li>
                <li className="flex items-center font-semibold"><Download className="h-4 w-4 mr-2 text-primary" />Download Reports (PDF, CSV)</li>
              </ul>
              <Button className="w-full">
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
