export interface SafeUser {
  id: number;
  username: string;
  avatarURL: string;
}

export interface ReactionCount {
  [reactionName: string]: number;
}

export interface Reaction {
  id: number;
  reaction_type_id: number;
  content_id: number;
  user_id: number;
}

export interface Post {
  id: number;
  user: SafeUser;
  title: string;
  content: string;
  file: string;
  privacy: string;
  created_at: string;
  reactions: ReactionCount;
  user_reaction?: Reaction;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  post_id: number;
  user: SafeUser;
  content: string;
  created_at: string;
  reactions: ReactionCount;
  user_reaction?: Reaction;
}

export interface ReactionType {
  id: number;
  name: string;
  icon_url: string;
}