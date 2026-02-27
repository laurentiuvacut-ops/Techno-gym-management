'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch((error: any) => {
    if (error?.code === 'permission-denied' || error?.code === 'PERMISSION_DENIED') {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data,
        })
      );
    } else {
      console.error(`Firestore set failed [${docRef.path}]:`, error);
    }
  });
}

/**
 * Initiates an addDoc operation for a collection reference.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  return addDoc(colRef, data).catch((error: any) => {
    if (error?.code === 'permission-denied' || error?.code === 'PERMISSION_DENIED') {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      );
    } else {
      console.error(`Firestore add failed [${colRef.path}]:`, error);
    }
  });
}

/**
 * Initiates an updateDoc operation for a document reference.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data).catch((error: any) => {
    if (error?.code === 'permission-denied' || error?.code === 'PERMISSION_DENIED') {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      );
    } else {
      console.error(`Firestore update failed [${docRef.path}]:`, error);
    }
  });
}

/**
 * Initiates a deleteDoc operation for a document reference.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef).catch((error: any) => {
    if (error?.code === 'permission-denied' || error?.code === 'PERMISSION_DENIED') {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      );
    } else {
      console.error(`Firestore delete failed [${docRef.path}]:`, error);
    }
  });
}
// FIX #6: Tratare diferențiată erori permisiuni vs erori rețea
