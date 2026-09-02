export type ListingType =
  | "hackathon"
  | "university_project"
  | "personal_project"
  | "startup"
  | "other";

export type LookingFor = "members" | "team";
export type Mode = "online" | "in_person";
export type ListingStatus = "open" | "closed";
export type SkillKind = "required" | "owned";
export type RequestStatus = "pending" | "accepted" | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  major: string | null;
  university: string | null;
  bio: string | null;
  avatar_url: string | null;
  contact_method: string | null;
  looking_for_team: boolean;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  type: ListingType;
  looking_for: LookingFor;
  description: string;
  members_needed: number;
  deadline: string | null;
  mode: Mode;
  location: string | null;
  external_link: string | null;
  status: ListingStatus;
  created_at: string;
}

export interface ListingSkill {
  id: string;
  listing_id: string;
  skill_id: string;
  kind: SkillKind;
}
export interface ProfileSkill {
  id: string;
  profile_id: string;
  skill_id: string;
}

export interface JoinRequest {
  id: string;
  listing_id: string;
  applicant_id: string;
  message: string;
  status: RequestStatus;
  created_at: string;
}

// Convenience shapes used once related rows are joined client-side.
export interface ListingWithRelations extends Listing {
  owner: Profile;
  required_skills: Skill[];
  owned_skills: Skill[];
}

export interface JoinRequestWithRelations extends JoinRequest {
  applicant: Profile;
  listing: Listing;
}

export const LISTING_TYPE_LABELS_AR: Record<ListingType, string> = {
  hackathon: "هاكاثون",
  university_project: "مشروع جامعي",
  personal_project: "مشروع شخصي",
  startup: "ستارت أب",
  other: "أخرى",
};

export const MODE_LABELS_AR: Record<Mode, string> = {
  online: "عن بُعد",
  in_person: "حضوري",
};

export const STATUS_LABELS_AR: Record<ListingStatus, string> = {
  open: "مفتوح",
  closed: "مغلق",
};

export const REQUEST_STATUS_LABELS_AR: Record<RequestStatus, string> = {
  pending: "قيد الانتظار",
  accepted: "مقبول",
  rejected: "مرفوض",
};

// Minimal Supabase Database type (kept loose on purpose — this project
// does not rely on the generated-types codegen workflow).
export type Database = any;
