'use client';

/**
 * CHATBOT ASSISTANT COMPONENT
 * 
 * Lightweight, non-blocking chatbot positioned on the right side of the page.
 * Answers common queries and sends emails when users select specific options.
 * 
 * Performance optimizations:
 * - Lazy loaded (only renders when opened)
 * - Minimal JavaScript bundle
 * - No external dependencies
 * - Fixed positioning doesn't affect layout
 * - Uses dynamic import for code splitting
 */

import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

type ChatMode = 'general' | 'custody_intake';

interface CustodyIntakeData {
  detaineeFullName: string;
  detaineeDateOfBirth: string;
  policeStation: string;
  arrestingForce: string;
  allegedOffences: string;
  custodyReferenceNumber: string;
  timeOfArrest: string;
  interviewStatus: string;
  urgencyAssessment: string; // free text; used to determine urgency flag
  callerName: string;
  callerRelationship: string;
  contactPhoneNumber: string;
}

type CustodyFieldKey = keyof CustodyIntakeData;

const emptyCustodyIntakeData = (): CustodyIntakeData => ({
  detaineeFullName: '',
  detaineeDateOfBirth: '',
  policeStation: '',
  arrestingForce: '',
  allegedOffences: '',
  custodyReferenceNumber: '',
  timeOfArrest: '',
  interviewStatus: '',
  urgencyAssessment: '',
  callerName: '',
  callerRelationship: '',
  contactPhoneNumber: '',
});

const CUSTODY_INTENT_TRIGGERS = [
  // Core required phrases
  'someone is in custody',
  'in custody',
  'arrested',
  'police station rep',
  'police station representation',
  'needs a solicitor',
  // Common variants
  'custody suite',
  'detained',
  'held at',
  'booked in',
  'interview under caution',
  'duty solicitor',
  'custody reference',
];

const isCustodyIntent = (message: string): boolean => {
  const m = message.toLowerCase();
  return CUSTODY_INTENT_TRIGGERS.some((p) => m.includes(p));
};

const looksImminent = (message: string): boolean => {
  const m = message.toLowerCase();
  return (
    m.includes('interview') && (m.includes('now') || m.includes('starting') || m.includes('in progress') || m.includes('imminent') || m.includes('soon')) ||
    m.includes('charge') && (m.includes('imminent') || m.includes('soon') || m.includes('decision') || m.includes('charging') || m.includes('about to')) ||
    m.includes('within') && (m.includes('hour') || m.includes('minutes'))
  );
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content:
        'Custody Intake Assistant.\n\nIf someone is under arrest, in police custody, or due to be interviewed at a police station, I can take the essential details for a qualified duty solicitor to contact you.\n\nAvailability: 9am to late.\nFor urgent matters, telephone 01732 247427.',
      timestamp: new Date(),
    },
  ]);
  const [showOptions, setShowOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('general');
  const [custodyStepIndex, setCustodyStepIndex] = useState(0);
  const [custodyData, setCustodyData] = useState<CustodyIntakeData>(emptyCustodyIntakeData());
  const [custodyUrgentEmailSent, setCustodyUrgentEmailSent] = useState(false);
  const [custodyFinalEmailSent, setCustodyFinalEmailSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addBotMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
        type: 'bot',
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const buildCustodyEmailBody = (data: CustodyIntakeData): { subject: string; body: string; urgent: boolean } => {
    const urgent = looksImminent(data.interviewStatus || '') || looksImminent(data.urgencyAssessment || '');

    const subject = 'URGENT – Police Station Custody Enquiry';
    const body = `
POLICE STATION CUSTODY ENQUIRY
=============================

URGENCY FLAG
------------
Urgent: ${urgent ? 'YES – interview/charging decision may be imminent' : 'No specific imminence stated'}
Urgency details: ${data.urgencyAssessment || 'Not provided'}
Interview status: ${data.interviewStatus || 'Not provided'}

DETAINEE DETAILS
----------------
Full name: ${data.detaineeFullName || 'Not provided'}
Date of birth: ${data.detaineeDateOfBirth || 'Not provided'}
Custody reference number: ${data.custodyReferenceNumber || 'Not provided'}
Time of arrest: ${data.timeOfArrest || 'Not provided'}

POLICE DETAILS
--------------
Police station / custody suite: ${data.policeStation || 'Not provided'}
Arresting force: ${data.arrestingForce || 'Not provided'}
Alleged offence(s): ${data.allegedOffences || 'Not provided'}

CALLER DETAILS
--------------
Caller name: ${data.callerName || 'Not provided'}
Relationship to detainee: ${data.callerRelationship || 'Not provided'}
Contact phone number: ${data.contactPhoneNumber || 'Not provided'}

NOTES
-----
- Information collected via website custody intake assistant.
- Services are provided by a qualified duty solicitor.
- Availability is 9am to late.

Timestamp: ${new Date().toISOString()}
    `.trim();

    return { subject, body, urgent };
  };

  const sendCustodyEmail = async (data: CustodyIntakeData, stage: 'urgent' | 'final') => {
    const urgentNow = looksImminent(data.interviewStatus || '') || looksImminent(data.urgencyAssessment || '');
    if (stage === 'urgent' && custodyUrgentEmailSent) return;
    if (stage === 'final' && custodyFinalEmailSent) return;

    const email = buildCustodyEmailBody(data);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/chatbot/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: email.subject,
          body: email.body,
          option: 'custody-intake',
        }),
      });
      if (response.ok) {
        if (stage === 'urgent') setCustodyUrgentEmailSent(true);
        if (stage === 'final') setCustodyFinalEmailSent(true);
        addBotMessage(
          stage === 'urgent'
            ? 'Urgent custody notification forwarded. Telephone 01732 247427 immediately if an interview or charging decision is imminent (availability: 9am to late).'
            : 'Custody enquiry forwarded to a qualified duty solicitor. If an interview or charging decision is imminent, telephone 01732 247427 (availability: 9am to late).'
        );
      } else {
        addBotMessage('Your details have been recorded. Please telephone 01732 247427 to ensure urgent escalation.');
      }
    } catch (error) {
      console.error('Error sending custody email:', error);
      addBotMessage('Please telephone 01732 247427. We could not automatically forward your custody enquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const custodySteps: Array<{ key: CustodyFieldKey; question: string; guidance?: string }> = [
    {
      key: 'detaineeFullName',
      question: 'Detainee full name (as held by police).',
    },
    {
      key: 'detaineeDateOfBirth',
      question: 'Detainee date of birth (DD/MM/YYYY).',
      guidance: 'If unknown, state “unknown”.',
    },
    {
      key: 'policeStation',
      question: 'Which police station / custody suite is the detainee at?',
    },
    {
      key: 'timeOfArrest',
      question: 'Time of arrest (approximate is acceptable).',
    },
    {
      key: 'interviewStatus',
      question: 'Interview status (not started / scheduled / in progress / completed / unknown).',
    },
    {
      key: 'urgencyAssessment',
      question: 'Is an interview or charging decision imminent? If yes, state how soon.',
      guidance: 'Example: “Interview starting within 30 minutes” or “Charging decision expected shortly”.',
    },
    {
      key: 'callerName',
      question: 'Caller full name.',
    },
    {
      key: 'callerRelationship',
      question: 'Relationship to the detainee (e.g., self / partner / parent / friend).',
    },
    {
      key: 'contactPhoneNumber',
      question: 'Best contact phone number for immediate call-back.',
    },
    {
      key: 'arrestingForce',
      question: 'Arresting force (e.g., Kent Police, Met Police).',
      guidance: 'If unknown, state “unknown”.',
    },
    {
      key: 'allegedOffences',
      question: 'Alleged offence(s) as stated by police (brief).',
    },
    {
      key: 'custodyReferenceNumber',
      question: 'Custody reference number (if available).',
      guidance: 'If not available, state “not provided”.',
    },
  ];

  const startCustodyIntake = (source: 'detected' | 'option') => {
    setChatMode('custody_intake');
    setCustodyStepIndex(0);
    setCustodyData(emptyCustodyIntakeData());
    setCustodyUrgentEmailSent(false);
    setCustodyFinalEmailSent(false);
    setShowOptions(false);

    addBotMessage(
      source === 'detected'
        ? 'Custody intake initiated based on your message.\n\nI will ask a series of legally relevant questions to take details for a qualified duty solicitor. I cannot provide case-specific legal advice.'
        : 'Custody intake initiated.\n\nI will ask a series of legally relevant questions to take details for a qualified duty solicitor. I cannot provide case-specific legal advice.'
    );
    addBotMessage('If an interview or charging decision is imminent, telephone 01732 247427 immediately (availability: 9am to late).');
    addBotMessage(`${custodySteps[0].question}${custodySteps[0].guidance ? `\n${custodySteps[0].guidance}` : ''}`);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Enhanced knowledge base with PACE 1984 rights and factual information
  const getResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // PACE 1984 Rights
    if (lowerMessage.includes('right') || lowerMessage.includes('entitle') || lowerMessage.includes('pace')) {
      return 'Under PACE 1984, you have a right to free legal advice at the police station. You may request a solicitor at any stage, including during interview. A qualified duty solicitor can advise you on your rights and procedure. For urgent representation arrangements, telephone 01732 247427 (availability: 9am to late).';
    }
    
    // Free legal advice
    if (lowerMessage.includes('free') || lowerMessage.includes('cost') || lowerMessage.includes('charge') || lowerMessage.includes('price')) {
      return 'Legal advice at the police station is free and is not means-tested. This applies whether a person has been arrested or is attending a voluntary interview. A qualified duty solicitor can advise and represent you. For urgent arrangements, telephone 01732 247427 (availability: 9am to late).';
    }
    
    // Need a solicitor
    if (lowerMessage.includes('need solicitor') || lowerMessage.includes('do i need') || lowerMessage.includes('should i get')) {
      return 'You are entitled to request a solicitor for police interview and custody procedures. A qualified duty solicitor can advise you on your rights and ensure proper procedure is followed. If this is a custody matter, I can take details for call-back, or you may telephone 01732 247427 (availability: 9am to late).';
    }
    
    // Rights at police station
    if (lowerMessage.includes('rights') && (lowerMessage.includes('police station') || lowerMessage.includes('custody'))) {
      return 'Your rights at the police station include: 1) Free legal advice (PACE 1984), 2) Right to remain silent, 3) Right to have someone informed of your arrest, 4) Right to medical attention if needed, 5) Right to see the PACE Codes of Practice. Always request a solicitor immediately. Call 01732 247427.';
    }
    
    // Voluntary interview
    if (lowerMessage.includes('voluntary') || lowerMessage.includes('caution + 3') || lowerMessage.includes('caution plus')) {
      return 'A voluntary interview (caution + 3) is a formal police interview where you\'re not under arrest. However, everything you say is recorded and can be used in court. You still have the right to FREE legal advice. Never attend without a solicitor. Call 01732 247427 for representation.';
    }
    
    // Interview under caution
    if (lowerMessage.includes('interview under caution') || lowerMessage.includes('caution interview')) {
      return 'An interview under caution is a formal police questioning. You\'ll hear: "You do not have to say anything, but it may harm your defence if you do not mention when questioned something which you later rely on in court." Always have a solicitor present. Legal advice is free. Call 01732 247427.';
    }
    
    // Duty solicitor
    if (lowerMessage.includes('duty solicitor') || lowerMessage.includes('duty scheme')) {
      return 'The duty solicitor scheme provides legal advice at the police station. You may request a duty solicitor or your own solicitor. Services are provided by a qualified duty solicitor. For attendance arrangements, telephone 01732 247427 (availability: 9am to late).';
    }
    
    // Representation doesn't imply guilt
    if (lowerMessage.includes('guilty') || lowerMessage.includes('innocent') || lowerMessage.includes('look bad')) {
      return 'Having a solicitor does NOT imply guilt. It\'s your legal right and protects you. Even innocent people should have legal representation to ensure their rights are protected and procedures are followed correctly. Legal advice is free and confidential. Call 01732 247427.';
    }
    
    // How to get representation
    if (lowerMessage.includes('how do i get') || lowerMessage.includes('how to get') || lowerMessage.includes('get representation') || lowerMessage.includes('get help now')) {
      return 'To arrange representation: (1) Tell the custody sergeant you require legal advice and request a duty solicitor, (2) Telephone 01732 247427 to arrange attendance and call-back, (3) If an interview or charging decision is imminent, state this clearly. Availability: 9am to late.';
    }
    
    // What happens at interview
    if (lowerMessage.includes('what happens') && (lowerMessage.includes('interview') || lowerMessage.includes('police station'))) {
      return 'During a police interview: 1) You\'ll be cautioned, 2) Questions will be asked and everything is recorded, 3) Your solicitor can intervene, request breaks, and advise you, 4) You can answer questions, make a prepared statement, or exercise your right to silence. Always have a solicitor present. Call 01732 247427.';
    }
    
    // Availability
    if (lowerMessage.includes('available') || lowerMessage.includes('hours') || lowerMessage.includes('when')) {
      return 'Availability is 9am to late. For urgent police station matters, telephone 01732 247427 and provide the detainee name, police station, and interview status.';
    }
    
    // Kent coverage
    if (lowerMessage.includes('kent') || lowerMessage.includes('station') || lowerMessage.includes('where')) {
      return 'We cover all police stations and custody suites across Kent, including: Medway, Maidstone, Gravesend, Canterbury, Tonbridge, Folkestone, Ashford, Sittingbourne, Margate, Dover, Sevenoaks, and all other Kent custody facilities. Call 01732 247427.';
    }
    
    // Response time
    if (lowerMessage.includes('time') || lowerMessage.includes('how long') || lowerMessage.includes('quick')) {
      return 'For custody enquiries, response depends on location and current commitments. If interview or charging decision is imminent, telephone 01732 247427 and state the urgency. Availability: 9am to late.';
    }
    
    // Arrested
    if (lowerMessage.includes('arrested') || lowerMessage.includes('in custody') || lowerMessage.includes('detained')) {
      return 'If a person has been arrested, they will be taken to a custody suite. They should request legal advice immediately and ask the custody sergeant to arrange a duty solicitor. If an interview or charging decision is imminent, telephone 01732 247427 and state the urgency (availability: 9am to late).';
    }
    
    // Contact form prompt
    if (lowerMessage.includes('form') || lowerMessage.includes('submit') || lowerMessage.includes('request')) {
      return 'To request police station representation, you may complete the contact form at /contact. For urgent custody matters, telephone 01732 247427 (availability: 9am to late).';
    }
    
    // Default helpful response
    return 'I can assist with police station representation enquiries, high-level information about rights under PACE 1984, and voluntary interview procedure. If someone is in custody or an interview is pending, I can take details for a qualified duty solicitor to contact you. Availability: 9am to late. Telephone 01732 247427 for urgent matters.';
  };

  const handleQuickOption = async (option: string) => {
    setShowOptions(false);
    
    let userMessage = '';
    let botResponse = '';
    let emailSubject = '';
    let emailBody = '';

    if (option === 'police-station') {
      userMessage = 'Police station custody enquiry (representation required).';
      botResponse = 'Understood. I will begin a structured custody intake now to capture the essential details for a qualified duty solicitor. If an interview or charging decision is imminent, telephone 01732 247427 immediately (availability: 9am to late).';

      // Add user + bot messages immediately, then start custody intake flow.
      addUserMessage(userMessage);
      addBotMessage(botResponse);
      startCustodyIntake('option');
      return;
    } else if (option === 'law-firm') {
      userMessage = 'I\'m a Criminal Law Firm - I need police station agent cover for my clients';
      botResponse = 'Thank you for your interest in our agent cover services. We provide reliable police station representation for law firms across the country. Please complete our contact form at /contact or call 01732 247427 to discuss your requirements and competitive rates.';
      emailSubject = 'New Enquiry: Law Firm Agent Cover Request';
      emailBody = `A criminal law firm has requested agent cover services.\n\nDetails:\n- Service: Agent Cover for Law Firms\n- Type: Criminal Law Firm\n- Need: Police station agent cover for clients\n\nPlease contact them to discuss requirements and rates.\n\nContact: 01732 247427\n\nThis is an automated notification from the website chatbot.\n\nUser should complete contact form at /contact for full details.`;
    }

    // Add user message
    addUserMessage(userMessage);

    // Add bot response
    addBotMessage(botResponse);

    // Send email
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/chatbot/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody,
          option: option,
        }),
      });

      if (response.ok) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          content: 'Your enquiry has been sent successfully. We will contact you shortly.',
          timestamp: new Date(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          content: 'Thank you for your enquiry. Please also call us on 01732 247427 for immediate assistance.',
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        type: 'bot',
        content: 'Thank you for your enquiry. Please call us on 01732 247427 for immediate assistance.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isSubmitting) return;

    addUserMessage(message);

    // Custody intake mode: store answer and ask next question
    if (chatMode === 'custody_intake') {
      const currentStep = custodySteps[custodyStepIndex];
      const answer = message.trim();
      const nextData: CustodyIntakeData = { ...custodyData, [currentStep.key]: answer };
      setCustodyData(nextData);

      const nextIndex = custodyStepIndex + 1;
      setCustodyStepIndex(nextIndex);

      const urgentNow = looksImminent(nextData.interviewStatus || '') || looksImminent(nextData.urgencyAssessment || '');
      if (urgentNow && !custodyUrgentEmailSent) {
        void sendCustodyEmail(nextData, 'urgent');
      }

      if (nextIndex >= custodySteps.length) {
        if (!custodyFinalEmailSent) {
          void sendCustodyEmail(nextData, 'final');
        }
        addBotMessage(
          'Thank you. If you have any additional information (e.g., custody reference number, expected interview time), you may provide it now.\n\nIf an interview or charging decision is imminent, telephone 01732 247427 immediately (availability: 9am to late).'
        );
        return;
      }

      const nextStep = custodySteps[nextIndex];
      addBotMessage(`${nextStep.question}${nextStep.guidance ? `\n${nextStep.guidance}` : ''}`);
      return;
    }

    // Detect custody intent and switch to structured intake flow
    if (isCustodyIntent(message)) {
      startCustodyIntake('detected');
      return;
    }

    // Get intelligent response
    const response = getResponse(message);
    
    // Add bot response
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      handleSendMessage(e.currentTarget.value);
      e.currentTarget.value = '';
    }
  };

  return (
    <>
      {/* Chat Button - Fixed bottom right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open chat assistant"
          title="Chat with our assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle h-8 w-8" aria-hidden="true">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-8rem)]'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-semibold">How Can We Help You?</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:text-blue-200 transition-colors p-1"
                aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {isMinimized ? (
                    <path d="M5 12h14M12 5v14"></path>
                  ) : (
                    <path d="M5 12h14"></path>
                  )}
                </svg>
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                  setShowOptions(true);
                  setChatMode('general');
                  setCustodyStepIndex(0);
                  setCustodyData(emptyCustodyIntakeData());
                  setCustodyUrgentEmailSent(false);
                  setCustodyFinalEmailSent(false);
                  setMessages([{
                    id: '1',
                    type: 'bot',
                    content:
                      'Custody Intake Assistant.\n\nIf someone is under arrest, in police custody, or due to be interviewed at a police station, I can take the essential details for a qualified duty solicitor to contact you.\n\nAvailability: 9am to late.\nFor urgent matters, telephone 01732 247427.',
                    timestamp: new Date(),
                  }]);
                }}
                className="text-white hover:text-blue-200 transition-colors p-1"
                aria-label="Close chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-800 border border-slate-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isSubmitting && (
                  <div className="flex justify-start">
                    <div className="bg-white text-slate-800 border border-slate-200 rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Options */}
              {showOptions && !isSubmitting && (
                <div className="p-4 bg-white border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Please select the option that best describes what you need:</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleQuickOption('police-station')}
                      className="w-full text-left bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                    >
                      <div className="font-semibold text-base">I Need Police Station Representation</div>
                      <div className="text-sm opacity-90 mt-1">I'm in custody, arrested, or have an upcoming police interview</div>
                    </button>
                    <button
                      onClick={() => handleQuickOption('law-firm')}
                      className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
                    >
                      <div className="font-semibold text-base">I'm a Criminal Law Firm</div>
                      <div className="text-sm opacity-90 mt-1">I need police station agent cover for my clients</div>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-3">
                    For all other enquiries, please use our <a href="/faq" className="text-blue-600 hover:underline">FAQ page</a> or call 01732 247427
                  </p>
                </div>
              )}

              {/* Input */}
              <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={chatMode === 'custody_intake' ? 'Type your answer...' : 'Type your question...'}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    onKeyPress={handleKeyPress}
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={() => {
                      if (inputRef.current?.value.trim()) {
                        handleSendMessage(inputRef.current.value);
                        inputRef.current.value = '';
                      }
                    }}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z"></path>
                      <path d="M22 2 11 13"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
