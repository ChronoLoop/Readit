import { useEffect, useRef } from 'react';
import { Id, toast } from 'react-toastify';
import { getServerErrorResponse } from './apiClient';

const useRequestErrorToast = () => {
    const toastIdRef = useRef<Id | null>(null);

    useEffect(() => {
        return () => {
            toastIdRef.current && toast.dismiss(toastIdRef.current);
        };
    }, []);

    const dismissToast = () => {
        toastIdRef.current && toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
    };

    const addToast = (error: unknown, defaultErrorMessage: string) => {
        const errorMessage = getServerErrorResponse(error)?.error;

        if (errorMessage && typeof errorMessage === 'string') {
            toastIdRef.current = toast(errorMessage, {
                position: 'bottom-center',
                type: 'error',
            });
        } else {
            toastIdRef.current = toast(defaultErrorMessage, {
                position: 'bottom-center',
                type: 'error',
            });
        }
    };

    return {
        addToast,
        dismissToast,
    };
};

export default useRequestErrorToast;
