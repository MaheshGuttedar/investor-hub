export interface Company {
  id: string;
  name: string;
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  investmentAmount: number;
  status: "active" | "completed" | "pending";
  thumbnail: string;
  description: string;
  location?: string;
  investingEntity?: string;
  documents: Document[];
}

export interface Document {
  id: string;
  name: string;
  type: "presentation" | "tax" | "financial" | "general";
  category?: string;
  investingEntity: string;
  asset: string;
  year: number;
  sharedDate: string;
  projectName: string;
  url: string;
  isNew?: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  projectName: string;
  type: "investment" | "distribution" | "return";
  amount: number;
  status: "completed" | "pending" | "processing";
  entity: string;
}

export interface Message {
  id: string;
  date: string;
  subject: string;
  body: string;
  from: "investor" | "admin";
}

export const companies: Company[] = [
  {
    id: "comp-a",
    name: "Siffi LLC",
    projects: [
      {
        id: "a1",
        name: "Lakes at Renaissance",
        investmentAmount: 250000,
        status: "active",
        thumbnail: "",
        description: "Multi-family residential development in Renaissance district",
        documents: [],
      },
      {
        id: "a2",
        name: "Riverside Commons",
        investmentAmount: 175000,
        status: "active",
        thumbnail: "",
        description: "Mixed-use commercial and residential project",
        documents: [],
      },
    ],
  },
  {
    id: "comp-b",
    name: "IRA Services Trust FBO ABC ",
    projects: [
      {
        id: "b1",
        name: "Princeton Parc",
        investmentAmount: 500000,
        status: "active",
        thumbnail: "",
        description: "Luxury condominium complex in Princeton area",
        documents: [],
      },
    ],
  },
  {
    id: "comp-c",
    name: "Greenfield Ventures LLC",
    projects: [
      {
        id: "c1",
        name: "Harbor Point",
        investmentAmount: 120000,
        status: "completed",
        thumbnail: "",
        description: "Waterfront retail and dining destination",
        documents: [],
      },
      {
        id: "c2",
        name: "Summit Ridge",
        investmentAmount: 300000,
        status: "active",
        thumbnail: "",
        description: "Mountain resort community development",
        documents: [],
      },
      {
        id: "c3",
        name: "Metro Gateway",
        investmentAmount: 450000,
        status: "pending",
        thumbnail: "",
        description: "Transit-oriented development near metro station",
        documents: [],
      },
    ],
  },
  {
    id: "comp-d",
    name: "IRA Services Trust FBO ABC ",
    projects: [
      {
        id: "d1",
        name: "CelinaMA",
        investmentAmount: 100000,
        status: "active",
        thumbnail: "",
        description: "",
        location: "Mark Alexander Ct and Kristina Ct, Celina, TX",
        investingEntity: "Xyz Trust ABC Account No 1234",
        documents: [],
      },
    ],
  },
  {
    id: "comp-e",
    name: "APV Retirement LLC",
    projects: [
      {
        id: "e1",
        name: "Leander282",
        investmentAmount: 12000,
        status: "active",
        thumbnail: "",
        description: "",
        location: "3360 County Road 282, Leander, TX",
        investingEntity: "APV Retirement LLC",
        documents: [],
      },
    ],
  },
];

export const taxDocuments: Document[] = [
  {
    id: "tax-1",
    name: "Trust Services FBO ABC Pap_41.pdf",
    type: "tax",
    investingEntity: "IRA Services Trust FBO ABC ",
    asset: "--",
    year: 2025,
    sharedDate: "04/25/25",
    projectName: "Princeton Parc",
    url: "#",
    isNew: true,
  },
  {
    id: "tax-2",
    name: "2024_SIFFI LLC_4646_K1_Partnership.pdf",
    type: "tax",
    investingEntity: "Siffi LLC",
    asset: "--",
    year: 2025,
    sharedDate: "03/19/25",
    projectName: "Lakes at Renaissance",
    url: "#",
  },
  {
    id: "tax-3",
    name: "2023_SIFFI LLC_4646_K1_Partnership.pdf",
    type: "tax",
    investingEntity: "Siffi LLC",
    asset: "--",
    year: 2024,
    sharedDate: "07/08/24",
    projectName: "Lakes at Renaissance",
    url: "#",
    isNew: true,
  },
  {
    id: "tax-4",
    name: "2023_SIFFI LLC_4646_K1_Partnership.pdf",
    type: "tax",
    investingEntity: "Siffi LLC",
    asset: "--",
    year: 2024,
    sharedDate: "04/08/24",
    projectName: "Lakes at Renaissance",
    url: "#",
  },
  {
    id: "tax-5",
    name: "IRA TRUST SERVICES FBO ABC _K1 2023 EM PRINCETON PARC GREEN LLC.pdf",
    type: "tax",
    investingEntity: "IRA Services Trust FBO ABC ",
    asset: "--",
    year: 2024,
    sharedDate: "03/21/24",
    projectName: "Princeton Parc",
    url: "#",
  },
  {
    id: "tax-6",
    name: "2022 EM Princeton Parc Green LLC K-1 - 106 IRA Trust Services FBO ABC .pdf",
    type: "tax",
    investingEntity: "IRA Services Trust FBO ABC ",
    asset: "--",
    year: 2023,
    sharedDate: "08/10/23",
    projectName: "Princeton Parc",
    url: "#",
  },
  {
    id: "tax-7",
    name: "2022_SIFFI LLC_4646_K1_Partnership.pdf",
    type: "tax",
    investingEntity: "Siffi LLC",
    asset: "--",
    year: 2023,
    sharedDate: "03/23/23",
    projectName: "Lakes at Renaissance",
    url: "#",
  },
];

export const financialDocuments: Document[] = [
  {
    id: "fin-1",
    name: "LARP Financials Sept 2020 to Q1 2021.pdf",
    type: "financial",
    category: "Reporting & Statements",
    investingEntity: "--",
    asset: "--",
    year: 2021,
    sharedDate: "08/17/21",
    projectName: "Lakes at Renaissance",
    url: "#",
  },
  {
    id: "fin-2",
    name: "Lakes at Renaissance November Newsletter 11.25.20",
    type: "financial",
    category: "General Documents",
    investingEntity: "--",
    asset: "--",
    year: 2020,
    sharedDate: "11/25/20",
    projectName: "Lakes at Renaissance",
    url: "#",
  },
  {
    id: "fin-3",
    name: "Lakes at Renaissance Takeover Newsletter 10.14.20",
    type: "financial",
    category: "General Documents",
    investingEntity: "--",
    asset: "--",
    year: 2020,
    sharedDate: "10/14/20",
    projectName: "Lakes at Renaissance",
    url: "#",
  },
  {
    id: "fin-4",
    name: "Princeton Parc Financials Q2 2021.pdf",
    type: "financial",
    category: "Reporting & Statements",
    investingEntity: "--",
    asset: "--",
    year: 2021,
    sharedDate: "08/17/21",
    projectName: "Princeton Parc",
    url: "#",
  },
  {
    id: "fin-5",
    name: "Princeton Parc Financials Q1 2021.pdf",
    type: "financial",
    category: "Reporting & Statements",
    investingEntity: "--",
    asset: "--",
    year: 2021,
    sharedDate: "08/17/21",
    projectName: "Princeton Parc",
    url: "#",
  },
  {
    id: "fin-6",
    name: "Princeton Parc Financials Q1-Q4 2020.pdf",
    type: "financial",
    category: "Reporting & Statements",
    investingEntity: "--",
    asset: "--",
    year: 2020,
    sharedDate: "08/17/21",
    projectName: "Princeton Parc",
    url: "#",
  },
];

export const transactions: Transaction[] = [
  { id: "t1", date: "2025-01-15", projectName: "Lakes at Renaissance", type: "distribution", amount: 3500, status: "completed", entity: "Siffi LLC" },
  { id: "t2", date: "2024-10-01", projectName: "Princeton Parc", type: "distribution", amount: 12500, status: "completed", entity: "IRA Services Trust FBO ABC " },
  { id: "t3", date: "2024-07-15", projectName: "Lakes at Renaissance", type: "distribution", amount: 3500, status: "completed", entity: "Siffi LLC" },
  { id: "t4", date: "2024-04-01", projectName: "Princeton Parc", type: "distribution", amount: 12500, status: "completed", entity: "IRA Services Trust FBO ABC " },
  { id: "t5", date: "2023-12-15", projectName: "Harbor Point", type: "return", amount: 145000, status: "completed", entity: "Greenfield Ventures LLC" },
  { id: "t6", date: "2023-06-01", projectName: "Summit Ridge", type: "investment", amount: 300000, status: "completed", entity: "Greenfield Ventures LLC" },
  { id: "t7", date: "2022-03-01", projectName: "Princeton Parc", type: "investment", amount: 500000, status: "completed", entity: "IRA Services Trust FBO ABC " },
  { id: "t8", date: "2021-08-15", projectName: "Lakes at Renaissance", type: "investment", amount: 250000, status: "completed", entity: "Siffi LLC" },
];

export const messages: Message[] = [
  { id: "m1", date: "2025-03-10", subject: "K-1 Documents Available", body: "Your 2024 K-1 tax documents are now available for download in the Tax Documents section.", from: "admin" },
  { id: "m2", date: "2025-02-20", subject: "Q4 Distribution", body: "Your Q4 2024 distribution has been processed. Please check your Transactions tab for details.", from: "admin" },
  { id: "m3", date: "2025-01-15", subject: "Question about Princeton Parc", body: "Hi, I had a question about the latest financial statement for Princeton Parc. Could you provide more details on the operating expenses?", from: "investor" },
];

export const investorProfile = {
  name: "ABC ",
  email: "ABC@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main Street, Suite 100, New York, NY 10001",
  entities: companies.map((c) => c.name),
  joinDate: "2021-08-15",
};
