import React, { createContext, useContext, useState } from 'react';

// Define the voice context type
interface VoiceContextType {
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  transcript: string;
  setTranscript: (transcript: string) => void;
  finalTranscript: string;
  setFinalTranscript: (transcript: string) => void;
  voiceError: any;
  setVoiceError: (error: any) => void;
  isSupported: boolean;
  setIsSupported: (supported: boolean) => void;
  isSpeakingSupported: boolean;
  setIsSpeakingSupported: (supported: boolean) => void;
}

// Create Voice context
const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

// Voice provider component
export const VoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [voiceError, setVoiceError] = useState<any>(null);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSpeakingSupported, setIsSpeakingSupported] = useState<boolean>(false);

  // Initialize voice capabilities
  // In a real implementation, this would check for Web Speech API availability

  // Context value
  const value = {
    isListening,
    setIsListening,
    isSpeaking,
    setIsSpeaking,
    transcript,
    setTranscript,
    finalTranscript,
    setFinalTranscript,
    voiceError,
    setVoiceError,
    isSupported,
    setIsSupported,
    isSpeakingSupported,
    setIsSpeakingSupported
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};

// Custom hook to use voice context
export const useVoiceContext = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoiceContext must be used within a VoiceProvider');
  }
  return context;
};

export default VoiceContext;