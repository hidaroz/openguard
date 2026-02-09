export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrganizationType =
  | "nonprofit"
  | "community_org"
  | "religious"
  | "educational"
  | "healthcare"
  | "advocacy"
  | "other";

export type InterviewStatus =
  | "in_progress"
  | "completed"
  | "abandoned";

export type ComplianceStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue";

export type ComplianceCategory =
  | "immediate"
  | "short_term"
  | "long_term"
  | "ongoing";

export type MessageRole = "user" | "assistant" | "system";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: OrganizationType;
          profile: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: OrganizationType;
          profile?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: OrganizationType;
          profile?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interviews: {
        Row: {
          id: string;
          organization_id: string;
          status: InterviewStatus;
          extracted_data: Json | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          status?: InterviewStatus;
          extracted_data?: Json | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          status?: InterviewStatus;
          extracted_data?: Json | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "interviews_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          interview_id: string;
          role: MessageRole;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          role: MessageRole;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          role?: MessageRole;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_interview_id_fkey";
            columns: ["interview_id"];
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          }
        ];
      };
      policies: {
        Row: {
          id: string;
          interview_id: string;
          organization_id: string;
          title: string;
          content_markdown: string;
          pdf_url: string | null;
          version: number;
          generated_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          organization_id: string;
          title: string;
          content_markdown: string;
          pdf_url?: string | null;
          version?: number;
          generated_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          organization_id?: string;
          title?: string;
          content_markdown?: string;
          pdf_url?: string | null;
          version?: number;
          generated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "policies_interview_id_fkey";
            columns: ["interview_id"];
            referencedRelation: "interviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "policies_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      compliance_items: {
        Row: {
          id: string;
          organization_id: string;
          policy_id: string | null;
          category: ComplianceCategory;
          title: string;
          description: string;
          status: ComplianceStatus;
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          policy_id?: string | null;
          category: ComplianceCategory;
          title: string;
          description: string;
          status?: ComplianceStatus;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          policy_id?: string | null;
          category?: ComplianceCategory;
          title?: string;
          description?: string;
          status?: ComplianceStatus;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "compliance_items_organization_id_fkey";
            columns: ["organization_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "compliance_items_policy_id_fkey";
            columns: ["policy_id"];
            referencedRelation: "policies";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      organization_type: OrganizationType;
      interview_status: InterviewStatus;
      message_role: MessageRole;
      compliance_status: ComplianceStatus;
      compliance_category: ComplianceCategory;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier use
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationInsert = Database["public"]["Tables"]["organizations"]["Insert"];
export type Interview = Database["public"]["Tables"]["interviews"]["Row"];
export type InterviewInsert = Database["public"]["Tables"]["interviews"]["Insert"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type Policy = Database["public"]["Tables"]["policies"]["Row"];
export type PolicyInsert = Database["public"]["Tables"]["policies"]["Insert"];
export type ComplianceItem = Database["public"]["Tables"]["compliance_items"]["Row"];
export type ComplianceItemInsert = Database["public"]["Tables"]["compliance_items"]["Insert"];

// Extracted interview data structure
export interface ExtractedInterviewData {
  organizationInfo?: {
    size?: string;
    staffCount?: number;
    volunteerCount?: number;
    mission?: string;
  };
  dataHandling?: {
    handlesDonorInfo?: boolean;
    handlesPayments?: boolean;
    handlesPII?: boolean;
    handlesMinorData?: boolean;
    handlesHealthData?: boolean;
    dataRetentionPolicy?: string;
  };
  technology?: {
    usesCloudServices?: boolean;
    cloudProviders?: string[];
    emailProvider?: string;
    hasWebsite?: boolean;
    usesCustomSoftware?: boolean;
    deviceManagement?: string;
  };
  accessControl?: {
    hasRemoteWorkers?: boolean;
    volunteersUseOwnDevices?: boolean;
    hasSharedAccounts?: boolean;
    uses2FA?: boolean;
    hasPasswordPolicy?: boolean;
  };
  currentPractices?: {
    hasBackups?: boolean;
    hasIncidentPlan?: boolean;
    hasSecurityTraining?: boolean;
    previousIncidents?: string;
  };
  concerns?: string[];
}
