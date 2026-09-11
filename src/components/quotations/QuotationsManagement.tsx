import React, { useState } from 'react';
import {
  Quotation,
  QuotationFormData,
  QuotationStatus,
} from '../../types/quotation';
import { Customer } from '../../types/customer';
import { Lead } from '../../types/lead';
import { Project } from '../../types/project';
import { QuotationDashboard } from './QuotationDashboard';
import { QuotationList } from './QuotationList';
import { QuotationFormModal } from './QuotationFormModal';
import { QuotationDetailModal } from './QuotationDetailModal';
import { QuotationPreviewModal } from './QuotationPreviewModal';
import { LinkProjectModal } from './LinkProjectModal';
import { DeleteConfirmModal } from '../crm/DeleteConfirmModal';

interface QuotationsManagementProps {
  quotations: Quotation[];
  customers: Customer[];
  leads?: Lead[];
  projects?: Project[];
  onCreateQuotation: (data: QuotationFormData) => Promise<{ success: boolean; error?: string }>;
  onUpdateQuotation: (id: string, data: Partial<QuotationFormData>) => Promise<{ success: boolean; error?: string }>;
  onDeleteQuotation: (id: string) => Promise<{ success: boolean; error?: string }>;
  onStatusChange: (id: string, status: QuotationStatus) => Promise<boolean>;
  onDuplicateQuotation: (id: string) => Promise<boolean>;
  onLinkProject: (quotationId: string, projectId: string) => Promise<boolean>;
  onCreateProject?: (quotation: Quotation) => void;
  onViewCustomer?: (customerId: string) => void;
  onViewLead?: (leadId: string) => void;
}

export const QuotationsManagement: React.FC<QuotationsManagementProps> = ({
  quotations,
  customers,
  leads = [],
  projects = [],
  onCreateQuotation,
  onUpdateQuotation,
  onDeleteQuotation,
  onStatusChange,
  onDuplicateQuotation,
  onLinkProject,
  onCreateProject,
  onViewCustomer,
  onViewLead,
}) => {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);
  const [linkingQuotation, setLinkingQuotation] = useState<Quotation | null>(null);
  const [deletingQuotation, setDeletingQuotation] = useState<Quotation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle Create or Update from Form Modal
  const handleFormSubmit = async (data: QuotationFormData): Promise<{ success: boolean; error?: string }> => {
    if (editingQuotation) {
      const res = await onUpdateQuotation(editingQuotation.id, data);
      if (res.success) {
        setEditingQuotation(null);
      }
      return res;
    } else {
      const res = await onCreateQuotation(data);
      if (res.success) {
        setIsCreateModalOpen(false);
      }
      return res;
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingQuotation) return;
    setIsDeleting(true);
    await onDeleteQuotation(deletingQuotation.id);
    setIsDeleting(false);
    setDeletingQuotation(null);
    if (viewingQuotation?.id === deletingQuotation.id) {
      setViewingQuotation(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Dashboard Metrics and Quick Filters */}
      <QuotationDashboard
        quotations={quotations}
        activeStatusFilter={activeStatusFilter}
        onSelectStatusFilter={setActiveStatusFilter}
        onOpenCreateModal={() => {
          setEditingQuotation(null);
          setIsCreateModalOpen(true);
        }}
      />

      {/* 2. Quotation List & Filter Controls */}
      <QuotationList
        quotations={quotations}
        customers={customers}
        activeStatusFilter={activeStatusFilter}
        onSelectStatusFilter={setActiveStatusFilter}
        onView={(q) => setViewingQuotation(q)}
        onPreview={(q) => setPreviewQuotation(q)}
        onEdit={(q) => {
          setEditingQuotation(q);
          setIsCreateModalOpen(true);
        }}
        onDuplicate={onDuplicateQuotation}
        onDelete={(q) => setDeletingQuotation(q)}
        onStatusChange={onStatusChange}
        onOpenCreateModal={() => {
          setEditingQuotation(null);
          setIsCreateModalOpen(true);
        }}
      />

      {/* MODALS */}
      {/* Form Modal (Create / Edit) */}
      <QuotationFormModal
        isOpen={isCreateModalOpen || Boolean(editingQuotation)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingQuotation(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingQuotation}
        customers={customers}
        leads={leads}
        projects={projects}
      />

      {/* Detail Modal */}
      <QuotationDetailModal
        isOpen={Boolean(viewingQuotation)}
        quotation={viewingQuotation}
        onClose={() => setViewingQuotation(null)}
        onEdit={(q) => {
          setViewingQuotation(null);
          setEditingQuotation(q);
        }}
        onPreview={(q) => {
          setPreviewQuotation(q);
        }}
        onDuplicate={(id) => {
          onDuplicateQuotation(id);
          setViewingQuotation(null);
        }}
        onDelete={(q) => {
          setDeletingQuotation(q);
        }}
        onStatusChange={async (id, status) => {
          await onStatusChange(id, status);
          if (viewingQuotation && viewingQuotation.id === id) {
            setViewingQuotation((prev) => (prev ? { ...prev, status } : null));
          }
        }}
        onOpenLinkProject={(q) => setLinkingQuotation(q)}
        onCreateProject={onCreateProject}
        onViewCustomer={onViewCustomer}
        onViewLead={onViewLead}
      />

      {/* Preview & Print Modal */}
      <QuotationPreviewModal
        isOpen={Boolean(previewQuotation)}
        quotation={previewQuotation}
        onClose={() => setPreviewQuotation(null)}
        onEdit={(q) => {
          setPreviewQuotation(null);
          setEditingQuotation(q);
        }}
      />

      {/* Link to Project Modal */}
      <LinkProjectModal
        isOpen={Boolean(linkingQuotation)}
        quotation={linkingQuotation}
        onClose={() => setLinkingQuotation(null)}
        onCreateNewProject={onCreateProject}
        onLinked={() => {
          // Re-sync viewing quotation if opened
          if (viewingQuotation && linkingQuotation && viewingQuotation.id === linkingQuotation.id) {
            setViewingQuotation((prev) => (prev ? { ...prev, project_id: 'linked' } : null));
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingQuotation)}
        title="Delete Commercial Quotation"
        message={`Are you sure you want to permanently delete quotation ${deletingQuotation?.quotation_number} ("${deletingQuotation?.title}")? This will remove all associated line items.`}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingQuotation(null)}
      />
    </div>
  );
};
