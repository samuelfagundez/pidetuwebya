export interface DemoPhoto {
  src: string;
  alt: string;
}

export interface DemoHours {
  day: string;
  hours: string;
}

export interface DemoSections {
  about: boolean;
  gallery: boolean;
  hours: boolean;
  location: boolean;
}

export interface DemoContent {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  /** Link a la ficha de Google Maps del negocio (opcional — el cliente lo
   * pega en "Personaliza tu web"). Vacío = no se muestra el enlace. */
  mapLink: string;
  hours: DemoHours[];
  banner: string;
  gallery: DemoPhoto[];
  primaryColor: string;
  secondaryColor: string;
  sections: DemoSections;
}
