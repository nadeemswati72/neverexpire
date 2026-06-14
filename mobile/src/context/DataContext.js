import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import * as DocumentService from "../services/DocumentService";
import * as FamilyService from "../services/FamilyService";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

/**
 * Family members + documents for the *current* user, backed by AsyncStorage
 * via FamilyService/DocumentService. Must be rendered inside AuthProvider —
 * everything is filtered by `user.id` so the two demo accounts never see
 * each other's data.
 */
export function DataProvider({ children }) {
  const { user } = useAuth();
  const [allFamilyMembers, setAllFamilyMembers] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const [members, documents] = await Promise.all([
      FamilyService.getAllFamilyMembers(),
      DocumentService.getAllDocuments(),
    ]);
    setAllFamilyMembers(members);
    setAllDocuments(documents);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const familyMembers = useMemo(
    () => (user ? allFamilyMembers.filter((member) => member.userId === user.id) : []),
    [allFamilyMembers, user]
  );

  const documents = useMemo(
    () => (user ? allDocuments.filter((doc) => doc.userId === user.id) : []),
    [allDocuments, user]
  );

  const summary = useMemo(() => DocumentService.getDashboardSummary(documents), [documents]);

  const saveDocument = useCallback(
    async (document) => {
      const updated = await DocumentService.saveDocument({ ...document, userId: user.id });
      setAllDocuments(updated);
      return updated;
    },
    [user]
  );

  const deleteDocument = useCallback(async (documentId) => {
    const updated = await DocumentService.deleteDocument(documentId);
    setAllDocuments(updated);
    return updated;
  }, []);

  const addFamilyMember = useCallback(
    async (member) => {
      const updated = await FamilyService.addFamilyMember({ ...member, userId: user.id });
      setAllFamilyMembers(updated);
      return updated;
    },
    [user]
  );

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
