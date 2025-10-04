export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          cpf: string
          created_at: string | null
          data_cadastro: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          status: string | null
          telefone: string
          user_id: string
        }
        Insert: {
          cpf: string
          created_at?: string | null
          data_cadastro?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          status?: string | null
          telefone: string
          user_id: string
        }
        Update: {
          cpf?: string
          created_at?: string | null
          data_cadastro?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          status?: string | null
          telefone?: string
          user_id?: string
        }
        Relationships: []
      }
      emprestimos: {
        Row: {
          cliente_id: string
          created_at: string | null
          data_emprestimo: string
          data_vencimento: string
          data_ultimo_calculo: string | null
          dias_atraso: number | null
          id: string
          juros_diarios_calculados: number | null
          status: string | null
          taxa_juros_diaria: number | null
          taxa_juros_diaria_atraso: number | null
          taxa_juros_mensal: number | null
          user_id: string
          valor_principal: number
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          data_emprestimo?: string
          data_ultimo_calculo?: string | null
          data_vencimento: string
          dias_atraso?: number | null
          id?: string
          juros_diarios_calculados?: number | null
          status?: string | null
          taxa_juros_diaria?: number | null
          taxa_juros_diaria_atraso?: number | null
          taxa_juros_mensal?: number | null
          user_id: string
          valor_principal: number
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          data_emprestimo?: string
          data_ultimo_calculo?: string | null
          data_vencimento?: string
          dias_atraso?: number | null
          id?: string
          juros_diarios_calculados?: number | null
          status?: string | null
          taxa_juros_diaria?: number | null
          taxa_juros_diaria_atraso?: number | null
          taxa_juros_mensal?: number | null
          user_id?: string
          valor_principal?: number
        }
        Relationships: [
          {
            foreignKeyName: "emprestimos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      lembretes: {
        Row: {
          cliente_id: string
          created_at: string | null
          data_envio: string | null
          emprestimo_id: string
          enviado: boolean | null
          id: string
          tipo: string
          user_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          data_envio?: string | null
          emprestimo_id: string
          enviado?: boolean | null
          id?: string
          tipo: string
          user_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          data_envio?: string | null
          emprestimo_id?: string
          enviado?: boolean | null
          id?: string
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lembretes_emprestimo_id_fkey"
            columns: ["emprestimo_id"]
            isOneToOne: false
            referencedRelation: "emprestimos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          created_at: string | null
          data_pagamento: string | null
          emprestimo_id: string
          id: string
          observacoes: string | null
          tipo_pagamento: string
          user_id: string
          valor_pago: number
        }
        Insert: {
          created_at?: string | null
          data_pagamento?: string | null
          emprestimo_id: string
          id?: string
          observacoes?: string | null
          tipo_pagamento: string
          user_id: string
          valor_pago: number
        }
        Update: {
          created_at?: string | null
          data_pagamento?: string | null
          emprestimo_id?: string
          id?: string
          observacoes?: string | null
          tipo_pagamento?: string
          user_id?: string
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_emprestimo_id_fkey"
            columns: ["emprestimo_id"]
            isOneToOne: false
            referencedRelation: "emprestimos"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_juros: {
        Row: {
          ativo: boolean | null
          cliente_id: string
          created_at: string | null
          id: string
          taxa_juros_diaria_atraso: number | null
          taxa_juros_diaria_padrao: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cliente_id: string
          created_at?: string | null
          id?: string
          taxa_juros_diaria_atraso?: number | null
          taxa_juros_diaria_padrao?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cliente_id?: string
          created_at?: string | null
          id?: string
          taxa_juros_diaria_atraso?: number | null
          taxa_juros_diaria_padrao?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_juros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nome: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          created_at: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          system_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          system_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          system_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      atualizar_status_emprestimos: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calcular_juros_diarios: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_configuracao_juros: {
        Args: {
          p_cliente_id: string
        }
        Returns: {
          taxa_juros_diaria_atraso: number
          taxa_juros_diaria_padrao: number
        }[]
      }
      get_system_config: {
        Args: Record<PropertyKey, never>
        Returns: {
          favicon_url: string | null
          logo_url: string | null
          primary_color: string
          secondary_color: string
          system_name: string
        }[]
      }
      save_system_config: {
        Args: {
          p_system_name: string
          p_logo_url: string | null
          p_favicon_url: string | null
          p_primary_color: string
          p_secondary_color: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
