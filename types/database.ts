export type ContentType = 'thought' | 'story' | 'tip'
export type ContentLang = 'it' | 'fr'
export type MoodValue = 'very_low' | 'low' | 'neutral' | 'good' | 'great'
export type NotificationSlot = 'morning' | 'evening'
export type SubscriptionStatus = 'free' | 'pro' | 'cancelled' | 'past_due'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          lang: ContentLang
          timezone: string
          notif_morning_enabled: boolean
          notif_morning_time: string
          notif_evening_enabled: boolean
          notif_evening_time: string
          onesignal_player_id: string | null
          subscription_status: SubscriptionStatus
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          lang?: ContentLang
          timezone?: string
          notif_morning_enabled?: boolean
          notif_morning_time?: string
          notif_evening_enabled?: boolean
          notif_evening_time?: string
          onesignal_player_id?: string | null
          subscription_status?: SubscriptionStatus
          onboarding_completed?: boolean
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          status: SubscriptionStatus
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      contents: {
        Row: {
          id: string
          type: ContentType
          lang: ContentLang
          title: string | null
          body: string
          source: string | null
          mood_target: MoodValue | null
          slot: NotificationSlot | null
          tags: string[]
          is_active: boolean
          generated_for_user: string | null
          generated_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['contents']['Insert']>
      }
      moods: {
        Row: {
          id: string
          user_id: string
          value: MoodValue
          slot: NotificationSlot
          note: string | null
          recorded_date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['moods']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['moods']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          content_id: string | null
          slot: NotificationSlot
          onesignal_notification_id: string | null
          sent_at: string
          opened_at: string | null
          sent_date: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'sent_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
    Functions: {
      get_today_content: {
        Args: { p_user_id: string; p_slot: NotificationSlot }
        Returns: {
          content_id: string
          content_type: ContentType
          title: string | null
          body: string
          tags: string[]
        }[]
      }
    }
  }
}

// Alias utili
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Content = Database['public']['Tables']['contents']['Row']
export type Mood = Database['public']['Tables']['moods']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
