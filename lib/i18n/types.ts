export type Translations = {
  lang: {
    title: string
    subtitle: string
    it: string
    fr: string
  }
  auth: {
    login: {
      title: string; subtitle: string; emailLabel: string; emailPlaceholder: string
      errorGeneric: string; buttonLoading: string; buttonCta: string; noPassword: string
      checkEmailTitle: string; checkEmailBody: string; checkEmailInstruction: string; checkEmailBack: string
      orDivider: string; googleCta: string
    }
    confirm: { loading: string }
    verify: {
      title: string; subtitle: string; codePlaceholder: string
      buttonCta: string; buttonLoading: string; resend: string; resendConfirm: string
      changeEmail: string; errorInvalid: string
    }
  }
  onboarding: {
    title: string; subtitle: string; intro: string; nameLabel: string; namePlaceholder: string
    langLabel: string; notifLabel: string; notifMorning: string; notifEvening: string
    notifNote: string; errorGeneric: string; buttonLoading: string; buttonCta: string
  }
  dashboard: {
    nav: { home: string; archive: string; profile: string; pro: string }
    home: {
      greetingMorning: string; greetingEvening: string; emptyState: string; proPromo: string
      footerPayoff: string
    }
    mood: {
      question: string; confirmed: string
      options: { very_low: string; low: string; neutral: string; good: string; great: string }
    }
    content: { tipLabel: string }
    pro: {
      planLabel: string; title: string; statusLabel: string; statusActive: string; statusActiveDesc: string
      toggleMonthly: string; toggleAnnual: string; savingsBadge: string
      priceMonthly: string; priceMonthlyNote: string; priceAnnual: string; priceAnnualNote: string
      feature1: string; feature2: string; feature3: string
      buttonLoading: string; buttonMonthly: string; buttonAnnual: string; cancelNote: string
      successWelcome: string; successTitle: string; successBody: string; successNote: string; successCta: string
    }
  }
  profile: {
    sectionAccount: string; sectionNotifications: string; sectionSubscription: string; sectionOther: string
    nameLabel: string; nameSave: string; emailLabel: string; langLabel: string
    morningLabel: string; eveningLabel: string
    themeLabel: string; themeSystem: string; themeLight: string; themeDark: string
    subscriptionFree: string; subscriptionPro: string; subscriptionRenewal: string
    upgradeMonthly: string; upgradeYearly: string; manageSubscription: string
    privacy: string; terms: string; logout: string; logoutConfirm: string; logoutCancel: string
  }
  payment: {
    successTitle: string; successSubtitle: string; successCta: string
    cancelTitle: string; cancelSubtitle: string; cancelCta: string
  }
}
