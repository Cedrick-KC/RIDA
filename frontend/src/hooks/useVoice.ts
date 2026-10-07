import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useApi } from './useApi';

// Define the voice hook return type
interface VoiceReturnType {
  // State
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  finalTranscript: string;
  error: string | null;

  // Actions
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string, options?: {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  }) => void;
  stopSpeaking: () => void;
  processCommand: (command: string) => Promise<any>;
  listenForWakeWord: (wakeWord?: string, callback?: () => void) => () => void;

  // Properties
  isSupported: boolean;
  synthesisSupported: boolean;
}

// Custom hook for voice control using Web Speech API
const useVoice = (): VoiceReturnType => {
  const { isAuthenticated } = useAuth();
  const { post } = useApi();

  // Speech recognition and synthesis objects
  const [SpeechRecognition, setSpeechRecognition] = useState<any>(null);
  const [SpeechSynthesisUtterance, setSpeechSynthesisUtterance] = useState<any>(null);
  const [synthesis, setSynthesis] = useState<any>(null);

  // State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [listeningRef, setListeningRef] = useState<boolean>(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    // Initialize SpeechRecognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionObj = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechRecognition(SpeechRecognitionObj);

      // Initialize SpeechSynthesis if available
      if ('speechSynthesis' in window) {
        setSpeechSynthesisUtterance(window.SpeechSynthesisUtterance);
        setSynthesis(window.speechSynthesis);
      }
    } else {
      setError('Web Speech API not supported in this browser');
    }
  }, []);

  // Initialize recognition object
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(interimTranscript);
        setFinalTranscript(finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Auto-restart if still supposed to be listening
        if (listeningRef) {
          startListening();
        }
      };

      recognitionRef.current = recognition;
    }
  }, [SpeechRecognition]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Authentication required for voice control');
      return;
    }

    if (!SpeechRecognition) {
      setError('Speech recognition not available');
      return;
    }

    try {
      setListeningRef(true);
      setIsListening(true);
      setError(null);
      recognitionRef.current.start();
    } catch (err: any) {
      setError(`Failed to start listening: ${err.message}`);
      setListeningRef(false);
    }
  }, [isAuthenticated, SpeechRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setListeningRef(false);
  }, []);

  // Speak text
  const speak = useCallback((text: string, options: {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}) => {
    if (!SpeechSynthesisUtterance || !synthesis) {
      setError('Speech synthesis not available');
      return;
    }

    // Cancel current speech
    synthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event: any) => {
      setError(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
    };

    synthesis.speak(utterance);
  }, [SpeechSynthesisUtterance, synthesis]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthesis) {
      synthesis.cancel();
    }
    setIsSpeaking(false);
  }, [synthesis]);

  // Process voice command
  const processCommand = useCallback(async (command: string) => {
    if (!isAuthenticated) return;

    try {
      // Send command to backend for processing
      const result = await post('/api/voice/command', { command });
      return result;
    } catch (err: any) {
      console.error('Error processing voice command:', err);
      throw err;
    }
  }, [isAuthenticated, post]);

  // Listen for wake word
  const listenForWakeWord = useCallback((wakeWord: string = 'hey rida', callback: (() => void) | undefined) => {
    if (!isAuthenticated) return;

    // This would continuously listen for the wake word
    // In a real implementation, you'd use a more efficient wake word detection
    const checkForWakeWord = () => {
      if (finalTranscript.toLowerCase().includes(wakeWord.toLowerCase())) {
        // Remove wake word from transcript
        const command = finalTranscript.toLowerCase().replace(wakeWord.toLowerCase(), '').trim();
        if (command) {
          // Reset transcript
          setFinalTranscript('');
          setTranscript('');
          // Process the command
          processCommand(command).then(callback).catch(console.error);
        }
      }
    };

    const interval = setInterval(checkForWakeWord, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, finalTranscript, processCommand]);

  return {
    // State
    isListening,
    isSpeaking,
    transcript,
    finalTranscript,
    error,

    // Actions
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    processCommand,
    listenForWakeWord,

    // Properties
    isSupported: !!SpeechRecognition,
    synthesisSupported: !!SpeechSynthesisUtterance
  };
};

export default useVoice;