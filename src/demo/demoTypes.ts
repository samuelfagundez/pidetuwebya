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
  hours: DemoHours[];
  banner: string;
  gallery: DemoPhoto[];
  primaryColor: string;
  secondaryColor: string;
  sections: DemoSections;
}
