import React from "react";
import {
    Stethoscope,
    ShoppingBag,
    FileText,
    DollarSign,
    Scale,
    Fuel,
    Truck,
    Utensils,
    Hotel,
    Plane,
    Landmark,
    Car,
    Radio,
    Briefcase
} from "lucide-react";

export const metadata = {
    title: "Industry Solutions | Free OCR Services",
    description: "AI-powered OCR solutions for Healthcare, Retail, Finance, Legal, and more. Transform your business documentation with our advanced text extraction services.",
};

interface ServiceSection {
    title: string;
    icon: React.ReactNode;
    items: {
        title: string;
        description: string;
    }[];
}

const services: ServiceSection[] = [
    // Row 1: Manufacturing, Healthcare, Retail
    {
        title: "Manufacturing",
        icon: <Briefcase className="w-6 h-6 text-blue-600" />,
        items: [
            {
                title: "Inventory Labeling",
                description: "Converts non-text inventory data to digital text for easy interpretation and analytics.",
            },
            {
                title: "Quality Assurance",
                description: "Rigorous testing ensures superior quality without any data loss.",
            },
            {
                title: "IoT Data Capture",
                description: "Converts IoT data to text for storage, analytics, and reporting.",
            },
            {
                title: "Technical Documentation",
                description: "Digitizes functional and technical documentation for easy reference.",
            },
        ],
    },
    {
        title: "Healthcare",
        icon: <Stethoscope className="w-6 h-6 text-blue-500" />,
        items: [
            {
                title: "Medical Record Digitization",
                description: "Converts prescriptions, lab reports, and patient files into structured digital text.",
            },
            {
                title: "System Integration",
                description: "Seamlessly integrates with EMR/EHR systems and digital health records.",
            },
            {
                title: "Clinical Summaries & Analytics",
                description: "Generates summaries and insights for faster diagnosis and reporting.",
            },
            {
                title: "Data Security & Accuracy",
                description: "Ensures no data loss and maintains compliance standards.",
            },
        ],
    },
    {
        title: "Retail",
        icon: <ShoppingBag className="w-6 h-6 text-green-500" />,
        items: [
            {
                title: "Invoice & Receipt Capture",
                description: "Digitizes purchase orders, receipts, and billing documents.",
            },
            {
                title: "Inventory Label Extraction",
                description: "Converts shelf labels and stock data into usable digital records.",
            },
            {
                title: "Sales & Supplier Analytics",
                description: "Analyzes data to identify trends and vendor performance.",
            },
            {
                title: "Real-Time Processing",
                description: "Enables faster inventory reconciliation and pricing decisions.",
            },
        ],
    },

    // Row 2: Banking, Automobile, Telecom
    {
        title: "Banking & Financial Services",
        icon: <Landmark className="w-6 h-6 text-emerald-700" />,
        items: [
            {
                title: "KYC & Onboarding Capture",
                description: "Digitizes identity and compliance documents.",
            },
            {
                title: "Loan & Statement Processing",
                description: "Extracts and structures financial records.",
            },
            {
                title: "Secure Data Handling",
                description: "Ensures confidentiality and regulatory compliance.",
            },
            {
                title: "Audit & Compliance Analytics",
                description: "Supports reporting and risk assessment.",
            },
        ],
    },
    {
        title: "Automobile",
        icon: <Car className="w-6 h-6 text-slate-600" />,
        items: [
            {
                title: "Service & Inspection Records",
                description: "Digitizes maintenance and inspection documents.",
            },
            {
                title: "Warranty & Invoice Capture",
                description: "Automates document processing across dealerships.",
            },
            {
                title: "Supply Chain Documentation",
                description: "Structures vendor and logistics data.",
            },
            {
                title: "Quality & Production Analytics",
                description: "Improves manufacturing and after-sales insights.",
            },
        ],
    },
    {
        title: "Telecom",
        icon: <Radio className="w-6 h-6 text-violet-500" />,
        items: [
            {
                title: "Customer Onboarding Documents",
                description: "Digitizes contracts and ID documents.",
            },
            {
                title: "Billing & Invoice Processing",
                description: "Extracts and validates billing data.",
            },
            {
                title: "Operational Data Capture",
                description: "Converts network and service records into text.",
            },
            {
                title: "Performance Analytics",
                description: "Enables data-driven operational decisions.",
            },
        ],
    },

    // Row 3: Oil & Gas, Travel, Hospitality
    {
        title: "Oil & Gas",
        icon: <Fuel className="w-6 h-6 text-orange-600" />,
        items: [
            {
                title: "Inspection & Safety Data Capture",
                description: "Digitizes safety logs and inspection reports.",
            },
            {
                title: "Operational Document Processing",
                description: "Converts drilling and maintenance records into text.",
            },
            {
                title: "Compliance Reporting",
                description: "Supports regulatory and audit requirements.",
            },
            {
                title: "Operational Analytics",
                description: "Provides insights for performance and risk management.",
            },
        ],
    },
    {
        title: "Travel",
        icon: <Plane className="w-6 h-6 text-sky-500" />,
        items: [
            {
                title: "Ticket & Itinerary Digitization",
                description: "Converts travel documents into structured data.",
            },
            {
                title: "Invoice & Vendor Processing",
                description: "Automates back-office documentation.",
            },
            {
                title: "Booking Data Analytics",
                description: "Improves planning and cost control.",
            },
            {
                title: "Faster Customer Servicing",
                description: "Reduces manual processing delays.",
            },
        ],
    },
    {
        title: "Hospitality",
        icon: <Hotel className="w-6 h-6 text-indigo-500" />,
        items: [
            {
                title: "Guest & Vendor Document Capture",
                description: "Digitizes booking, billing, and vendor records.",
            },
            {
                title: "Invoice & Procurement Processing",
                description: "Automates financial document handling.",
            },
            {
                title: "Centralized Data Management",
                description: "Stores all documents in a unified digital system.",
            },
            {
                title: "Operational Analytics",
                description: "Identifies cost savings and service improvement opportunities.",
            },
        ],
    },

    // Row 4+: Food & Beverages, Legal, Documentation, Logistics, Finance
    {
        title: "Food & Beverages",
        icon: <Utensils className="w-6 h-6 text-red-500" />,
        items: [
            {
                title: "Quality Control Documentation",
                description: "Digitizes production and quality inspection logs.",
            },
            {
                title: "Label & Packaging Data Capture",
                description: "Extracts data for traceability and compliance.",
            },
            {
                title: "Inventory & Supplier Analysis",
                description: "Supports stock optimization and vendor monitoring.",
            },
            {
                title: "Regulatory Reporting",
                description: "Ensures adherence to food safety standards.",
            },
        ],
    },
    {
        title: "Legal",
        icon: <Scale className="w-6 h-6 text-purple-600" />,
        items: [
            {
                title: "Contract & Case File Digitization",
                description: "Converts legal documents into structured digital text.",
            },
            {
                title: "Handwritten Text Recognition",
                description: "Accurately captures notes and legacy documents.",
            },
            {
                title: "Searchable Legal Records",
                description: "Enables faster document discovery and review.",
            },
            {
                title: "Case Analytics & Summaries",
                description: "Supports efficient legal analysis and case preparation.",
            },
        ],
    },
    {
        title: "Documentation & Records",
        icon: <FileText className="w-6 h-6 text-gray-500" />,
        items: [
            {
                title: "Document Digitization",
                description: "Converts physical and scanned documents into searchable text.",
            },
            {
                title: "Automated Indexing",
                description: "Organizes documents for quick retrieval and reference.",
            },
            {
                title: "Data Summarization",
                description: "Creates concise summaries for faster review.",
            },
            {
                title: "Compliance-Ready Storage",
                description: "Supports audits and regulatory requirements.",
            },
        ],
    },
    {
        title: "Logistics & Supply Chain",
        icon: <Truck className="w-6 h-6 text-yellow-600" />,
        items: [
            {
                title: "Shipping Document Digitization",
                description: "Extracts data from bills of lading and delivery notes.",
            },
            {
                title: "Inventory & Warehouse Records",
                description: "Structures inventory movement data.",
            },
            {
                title: "Automated Data Routing",
                description: "Sends data to ERP or warehouse systems.",
            },
            {
                title: "Logistics Analytics",
                description: "Improves shipment tracking and vendor performance visibility.",
            },
        ],
    },
    {
        title: "Finance",
        icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
        items: [
            {
                title: "Financial Document Extraction",
                description: "Digitizes invoices, statements, and tax records.",
            },
            {
                title: "Data Structuring & Validation",
                description: "Ensures accuracy before routing into financial systems.",
            },
            {
                title: "Automated Reporting",
                description: "Generates summaries for reconciliation and audits.",
            },
            {
                title: "Risk & Compliance Support",
                description: "Reduces manual errors and compliance gaps.",
            },
        ],
    },
];

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                        AI Solutions for All Industries
                    </h1>
                    <p className="max-w-4xl mx-auto text-xl text-gray-600 leading-relaxed">
                        We provide various AI solutions to all the industries. Whether setting up Agentic AI,
                        planning the workflows and orchestrating the Agents and Super Agents and make them
                        seamlessly work for improved efficiency and outstanding results. The Agents work 24/7.
                        You get the real time analytics. Production is improvised, sales is increased, profits are
                        rationalized and people are determined more than ever.
                    </p>
                </div>

                {/* Industry Grid */}
                <div className="flex flex-wrap justify-center gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)] bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full"
                        >
                            <div className="p-6">
                                <div className="bg-gray-50 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                                <div className="space-y-4">
                                    {service.items.map((item, i) => (
                                        <div key={i} className="group">
                                            <h4 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                                                {item.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
