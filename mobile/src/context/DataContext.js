import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import * as DocumentService from "../services/DocumentService";
import * as FamilyService from "../services/FamilyService";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

/**
 * Family members + documents for the *current* user, backed by the real
 * Flask backend via FamilyService/DocumentService. The backend already
 * scopes everything to the authenticated user (JWT), so — unlike the old
 * AsyncStorage version — no client-side userId filtering is needed here.
 */
export function DataProvider({ children }) {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setFamilyMembers([]);
      setDocuments([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const [members, docs] = await Promise.all([
      FamilyService.getAllFamilyMembers(),
      DocumentService.getAllDocuments(),
    ]);
    setFamilyMembers(members);
    setDocuments(docs);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const summary = useMemo(() => DocumentService.getDashboardSummary(documents), [documents]);

  const saveDocument = useCallback(async (document) => {
    const { documents: updated, saved } = await DocumentService.saveDocument(document);
    setDocuments(updated);
    return saved;
  }, []);

  const deleteDocument = useCallback(async (documentId) => {
    const updated = await DocumentService.deleteDocument(documentId);
    setDocuments(updated);
    return updated;
  }, []);

  const addFamilyMember = useCallback(async (member) => {
    const updated = await FamilyService.addFamilyMember(member);
    setFamilyMembers(updated);
    return updated;
  }, []);

  const getDocumentsForMember = useCallback(
    (familyMemberId) => documents.filter((doc) => doc.familyMemberId === familyMemberId),
    [documents]
  );

  const getDocumentById = useCallback(
    (documentId) => documents.find((doc) => doc.id === documentId) || null,
    [documents]
  );

  const getFamilyMemberById = useCallback(
    (familyMemberId) => familyMembers.find((member) => member.id === familyMemberId) || null,
    [familyMembers]
  );

  const value = {
    familyMembers,
    documents,
    summary,
    isLoading,
    reload,
    saveDocument,
    deleteDocument,
    addFamilyMember,
    getDocumentsForMember,
    getDocumentById,
    getFamilyMemberById,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useAppData must be used within a DataProvider");
  }
  return context;
}
