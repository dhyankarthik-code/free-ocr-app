"use client"

import { useState, useRef, useMemo } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSession } from "@/hooks/use-session"
import AuthModal from "@/components/auth-modal"
import ReCAPTCHA from "react-google-recaptcha"
import { Loader2, CheckCircle2, Mail, User, Globe, Phone, MessageSquare, Search, X } from "lucide-react"

const COUNTRY_PHONE_CODES: { [key: string]: { code: string, digits: number } } = {
    "Afghanistan": { code: "+93", digits: 9 },
    "Albania": { code: "+355", digits: 9 },
    "Algeria": { code: "+213", digits: 9 },
    "Andorra": { code: "+376", digits: 6 },
    "Angola": { code: "+244", digits: 9 },
    "Antigua and Barbuda": { code: "+1", digits: 10 },
    "Argentina": { code: "+54", digits: 10 },
    "Armenia": { code: "+374", digits: 8 },
    "Australia": { code: "+61", digits: 9 },
    "Austria": { code: "+43", digits: 10 },
    "Azerbaijan": { code: "+994", digits: 9 },
    "Bahamas": { code: "+1", digits: 10 },
    "Bahrain": { code: "+973", digits: 8 },
    "Bangladesh": { code: "+880", digits: 10 },
    "Barbados": { code: "+1", digits: 10 },
    "Belarus": { code: "+375", digits: 9 },
    "Belgium": { code: "+32", digits: 9 },
    "Belize": { code: "+501", digits: 7 },
    "Benin": { code: "+229", digits: 8 },
    "Bhutan": { code: "+975", digits: 8 },
    "Bolivia": { code: "+591", digits: 8 },
    "Bosnia and Herzegovina": { code: "+387", digits: 8 },
    "Botswana": { code: "+267", digits: 8 },
    "Brazil": { code: "+55", digits: 11 },
    "Brunei": { code: "+673", digits: 7 },
    "Bulgaria": { code: "+359", digits: 9 },
    "Burkina Faso": { code: "+226", digits: 8 },
    "Burundi": { code: "+257", digits: 8 },
    "Cabo Verde": { code: "+238", digits: 7 },
    "Cambodia": { code: "+855", digits: 8 },
    "Cameroon": { code: "+237", digits: 9 },
    "Canada": { code: "+1", digits: 10 },
    "Central African Republic": { code: "+236", digits: 8 },
    "Chad": { code: "+235", digits: 8 },
    "Chile": { code: "+56", digits: 9 },
    "China": { code: "+86", digits: 11 },
    "Colombia": { code: "+57", digits: 10 },
    "Comoros": { code: "+269", digits: 7 },
    "Congo (Congo-Brazzaville)": { code: "+242", digits: 9 },
    "Costa Rica": { code: "+506", digits: 8 },
    "Croatia": { code: "+385", digits: 9 },
    "Cuba": { code: "+53", digits: 8 },
    "Cyprus": { code: "+357", digits: 8 },
    "Czech Republic": { code: "+420", digits: 9 },
    "Democratic Republic of the Congo": { code: "+243", digits: 9 },
    "Denmark": { code: "+45", digits: 8 },
    "Djibouti": { code: "+253", digits: 8 },
    "Dominica": { code: "+1", digits: 10 },
    "Dominican Republic": { code: "+1", digits: 10 },
    "Ecuador": { code: "+593", digits: 9 },
    "Egypt": { code: "+20", digits: 10 },
    "El Salvador": { code: "+503", digits: 8 },
    "Equatorial Guinea": { code: "+240", digits: 9 },
    "Eritrea": { code: "+291", digits: 7 },
    "Estonia": { code: "+372", digits: 7 },
    "Eswatini": { code: "+268", digits: 8 },
    "Ethiopia": { code: "+251", digits: 9 },
    "Fiji": { code: "+679", digits: 7 },
    "Finland": { code: "+358", digits: 9 },
    "France": { code: "+33", digits: 9 },
    "Gabon": { code: "+241", digits: 7 },
    "Gambia": { code: "+220", digits: 7 },
    "Georgia": { code: "+995", digits: 9 },
    "Germany": { code: "+49", digits: 10 },
    "Ghana": { code: "+233", digits: 9 },
    "Greece": { code: "+30", digits: 10 },
    "Grenada": { code: "+1", digits: 10 },
    "Guatemala": { code: "+502", digits: 8 },
    "Guinea": { code: "+224", digits: 9 },
    "Guinea-Bissau": { code: "+245", digits: 9 },
    "Guyana": { code: "+592", digits: 7 },
    "Haiti": { code: "+509", digits: 8 },
    "Honduras": { code: "+504", digits: 8 },
    "Hungary": { code: "+36", digits: 9 },
    "Iceland": { code: "+354", digits: 7 },
    "India": { code: "+91", digits: 10 },
    "Indonesia": { code: "+62", digits: 10 },
    "Iran": { code: "+98", digits: 10 },
    "Iraq": { code: "+964", digits: 10 },
    "Ireland": { code: "+353", digits: 9 },
    "Israel": { code: "+972", digits: 9 },
    "Italy": { code: "+39", digits: 10 },
    "Ivory Coast": { code: "+225", digits: 10 },
    "Jamaica": { code: "+1", digits: 10 },
    "Japan": { code: "+81", digits: 10 },
    "Jordan": { code: "+962", digits: 9 },
    "Kazakhstan": { code: "+7", digits: 10 },
    "Kenya": { code: "+254", digits: 9 },
    "Kiribati": { code: "+686", digits: 5 },
    "Kuwait": { code: "+965", digits: 8 },
    "Kyrgyzstan": { code: "+996", digits: 9 },
    "Laos": { code: "+856", digits: 10 },
    "Latvia": { code: "+371", digits: 8 },
    "Lebanon": { code: "+961", digits: 8 },
    "Lesotho": { code: "+266", digits: 8 },
    "Liberia": { code: "+231", digits: 7 },
    "Libya": { code: "+218", digits: 9 },
    "Liechtenstein": { code: "+423", digits: 7 },
    "Lithuania": { code: "+370", digits: 8 },
    "Luxembourg": { code: "+352", digits: 9 },
    "Madagascar": { code: "+261", digits: 9 },
    "Malawi": { code: "+265", digits: 9 },
    "Malaysia": { code: "+60", digits: 9 },
    "Maldives": { code: "+960", digits: 7 },
    "Mali": { code: "+223", digits: 8 },
    "Malta": { code: "+356", digits: 8 },
    "Marshall Islands": { code: "+692", digits: 7 },
    "Mauritania": { code: "+222", digits: 8 },
    "Mauritius": { code: "+230", digits: 8 },
    "Mexico": { code: "+52", digits: 10 },
    "Micronesia": { code: "+691", digits: 7 },
    "Moldova": { code: "+373", digits: 8 },
    "Monaco": { code: "+377", digits: 8 },
    "Mongolia": { code: "+976", digits: 8 },
    "Montenegro": { code: "+382", digits: 8 },
    "Morocco": { code: "+212", digits: 9 },
    "Mozambique": { code: "+258", digits: 9 },
    "Myanmar": { code: "+95", digits: 9 },
    "Namibia": { code: "+264", digits: 9 },
    "Nauru": { code: "+674", digits: 7 },
    "Nepal": { code: "+977", digits: 10 },
    "Netherlands": { code: "+31", digits: 9 },
    "New Zealand": { code: "+64", digits: 9 },
    "Nicaragua": { code: "+505", digits: 8 },
    "Niger": { code: "+227", digits: 8 },
    "Nigeria": { code: "+234", digits: 10 },
    "North Korea": { code: "+850", digits: 10 },
    "North Macedonia": { code: "+389", digits: 8 },
    "Norway": { code: "+47", digits: 8 },
    "Oman": { code: "+968", digits: 8 },
    "Pakistan": { code: "+92", digits: 10 },
    "Palau": { code: "+680", digits: 7 },
    "Palestine": { code: "+970", digits: 9 },
    "Panama": { code: "+507", digits: 8 },
    "Papua New Guinea": { code: "+675", digits: 8 },
    "Paraguay": { code: "+595", digits: 9 },
    "Peru": { code: "+51", digits: 9 },
    "Philippines": { code: "+63", digits: 10 },
    "Poland": { code: "+48", digits: 9 },
    "Portugal": { code: "+351", digits: 9 },
    "Qatar": { code: "+974", digits: 8 },
    "Romania": { code: "+40", digits: 9 },
    "Russia": { code: "+7", digits: 10 },
    "Rwanda": { code: "+250", digits: 9 },
    "Saint Kitts and Nevis": { code: "+1", digits: 10 },
    "Saint Lucia": { code: "+1", digits: 10 },
    "Saint Vincent and the Grenadines": { code: "+1", digits: 10 },
    "Samoa": { code: "+685", digits: 5 },
    "San Marino": { code: "+378", digits: 10 },
    "Sao Tome and Principe": { code: "+239", digits: 7 },
    "Saudi Arabia": { code: "+966", digits: 9 },
    "Senegal": { code: "+221", digits: 9 },
    "Serbia": { code: "+381", digits: 8 },
    "Seychelles": { code: "+248", digits: 7 },
    "Sierra Leone": { code: "+232", digits: 8 },
    "Singapore": { code: "+65", digits: 8 },
    "Slovakia": { code: "+421", digits: 9 },
    "Slovenia": { code: "+386", digits: 8 },
    "Solomon Islands": { code: "+677", digits: 7 },
    "Somalia": { code: "+252", digits: 8 },
    "South Africa": { code: "+27", digits: 9 },
    "South Korea": { code: "+82", digits: 10 },
    "South Sudan": { code: "+211", digits: 9 },
    "Spain": { code: "+34", digits: 9 },
    "Sri Lanka": { code: "+94", digits: 9 },
    "Sudan": { code: "+249", digits: 9 },
    "Suriname": { code: "+597", digits: 7 },
    "Sweden": { code: "+46", digits: 9 },
    "Switzerland": { code: "+41", digits: 9 },
    "Syria": { code: "+963", digits: 9 },
    "Taiwan": { code: "+886", digits: 9 },
    "Tajikistan": { code: "+992", digits: 9 },
    "Tanzania": { code: "+255", digits: 9 },
    "Thailand": { code: "+66", digits: 9 },
    "Timor-Leste": { code: "+670", digits: 8 },
    "Togo": { code: "+228", digits: 8 },
    "Tonga": { code: "+676", digits: 5 },
    "Trinidad and Tobago": { code: "+1", digits: 10 },
    "Tunisia": { code: "+216", digits: 8 },
    "Turkey": { code: "+90", digits: 10 },
    "Turkmenistan": { code: "+993", digits: 8 },
    "Tuvalu": { code: "+688", digits: 5 },
    "Uganda": { code: "+256", digits: 9 },
    "Ukraine": { code: "+380", digits: 9 },
    "United Arab Emirates": { code: "+971", digits: 9 },
    "United Kingdom": { code: "+44", digits: 10 },
    "United States": { code: "+1", digits: 10 },
    "Uruguay": { code: "+598", digits: 8 },
    "Uzbekistan": { code: "+998", digits: 9 },
    "Vanuatu": { code: "+678", digits: 7 },
    "Vatican City": { code: "+39", digits: 10 },
    "Venezuela": { code: "+58", digits: 10 },
    "Vietnam": { code: "+84", digits: 9 },
    "Yemen": { code: "+967", digits: 9 },
    "Zambia": { code: "+260", digits: 9 },
    "Zimbabwe": { code: "+263", digits: 9 }
}

const COUNTRIES = Object.keys(COUNTRY_PHONE_CODES).sort()

export default function ContactPage() {
    const { session, logout } = useSession()
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        country: "",
        mobile: "",
        message: ""
    })
    const [countrySearch, setCountrySearch] = useState("")
    const [showCountryDropdown, setShowCountryDropdown] = useState(false)
    const [captchaVerified, setCaptchaVerified] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
    const recaptchaRef = useRef<ReCAPTCHA>(null)
    const countryInputRef = useRef<HTMLInputElement>(null)

    // Filter countries based on search
    const filteredCountries = useMemo(() => {
        if (!countrySearch) return COUNTRIES
        return COUNTRIES.filter(country =>
            country.toLowerCase().includes(countrySearch.toLowerCase())
        )
    }, [countrySearch])

    const validateEmail = (email: string) => {
        // RFC 5322 compliant email regex but with strict TLD requirement (must have at least one dot in domain part)
        // Previous regex allow user@domain, now we enforce user@domain.com
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/
        return email.length > 0 && email.length <= 254 && emailRegex.test(email)
    }

    const getPhoneConfig = () => {
        return COUNTRY_PHONE_CODES[formData.country] || { code: "", digits: 10 }
    }

    // Real-time validation - check if input contains invalid characters
    const hasInvalidNameChars = (value: string) => {
        return /[0-9]/.test(value) // Returns true if contains numbers
    }

    const hasInvalidMobileChars = (value: string) => {
        return /[a-zA-Z]/.test(value) // Returns true if contains letters
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Strict Validation: Allow only letters and spaces
        if (value && !/^[a-zA-Z\s]*$/.test(value)) {
            // If invalid char is typed, don't update state (prevent typing)
            // Or unblock typing but show error immediately. 
            // User requested "not allowing spl characters", so blocking is better UX for strictness.
            return
        }

        setFormData(prev => ({ ...prev, name: value }))

        if (value.trim().length > 0 && value.trim().length < 2) {
            setErrors(prev => ({ ...prev, name: "Name must be at least 2 characters" }))
        } else {
            setErrors(prev => ({ ...prev, name: "" }))
        }
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFormData(prev => ({ ...prev, email: value }))

        // Only show error after user has typed @ (indicating they're attempting full email)
        // Otherwise wait for blur to validate
        if (value.includes('@') && !validateEmail(value)) {
            setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
        } else {
            setErrors(prev => ({ ...prev, email: "" }))
        }
    }

    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Strict Validation: Allow only digits
        if (value && !/^\d*$/.test(value)) {
            return
        }

        // Check max length based on country
        const phoneConfig = getPhoneConfig()
        const maxDigits = phoneConfig.digits || 15 // default to 15 if unknown

        if (value.length > maxDigits) {
            return // Block typing more than allowed digits
        }

        setFormData(prev => ({ ...prev, mobile: value }))
        setErrors(prev => ({ ...prev, mobile: "" }))
    }

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        if (value.length <= 200) {
            setFormData(prev => ({ ...prev, message: value }))
            if (errors.message) setErrors(prev => ({ ...prev, message: "" }))
        }
    }

    const handleCountrySelect = (country: string) => {
        setFormData(prev => ({ ...prev, country: country, mobile: "" }))
        setCountrySearch("")
        setShowCountryDropdown(false)
        if (errors.country) setErrors(prev => ({ ...prev, country: "" }))
    }

    const handleCaptchaChange = (value: string | null) => {
        setCaptchaVerified(!!value)
    }

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))

        // Validate on blur
        if (field === 'email') {
            if (formData.email && !validateEmail(formData.email)) {
                setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors: { [key: string]: string } = {}
        const phoneConfig = getPhoneConfig()

        // Clean name (remove numbers for submission)
        const cleanedName = formData.name.replace(/[^a-zA-Z\s]/g, "").trim()

        if (!cleanedName) {
            newErrors.name = "Name is required"
        } else if (cleanedName.length < 2) {
            newErrors.name = "Name must be at least 2 characters"
        } else if (hasInvalidNameChars(formData.name)) {
            newErrors.name = "Name should contain only letters"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        if (!formData.country) {
            newErrors.country = "Please select a country"
        }

        // Clean mobile (remove non-digits for validation)
        const cleanedMobile = formData.mobile.replace(/[^0-9]/g, "")

        if (!cleanedMobile) {
            newErrors.mobile = "Mobile number is required"
        } else if (hasInvalidMobileChars(formData.mobile)) {
            newErrors.mobile = "Mobile number should contain only digits"
        } else if (phoneConfig.code && cleanedMobile.length !== phoneConfig.digits) {
            newErrors.mobile = `Mobile number must be exactly ${phoneConfig.digits} digits for ${formData.country}`
        } else if (!phoneConfig.code && cleanedMobile.length < 7) {
            newErrors.mobile = "Please enter a valid mobile number"
        }

        if (!formData.message.trim()) {
            newErrors.message = "Message is required"
        } else if (formData.message.trim().length < 10) {
            newErrors.message = "Message must be at least 10 characters"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        if (!captchaVerified) {
            alert("Please verify you're not a robot")
            return
        }

        setSubmitting(true)

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: cleanedName,
                    email: formData.email,
                    country: formData.country,
                    mobile: phoneConfig.code ? `'${phoneConfig.code} ${cleanedMobile}` : `'${cleanedMobile}`,
                    message: formData.message
                })
            })

            if (!response.ok) {
                throw new Error("Failed to submit form")
            }

            setSubmitted(true)
            setFormData({
                name: "",
                email: "",
                country: "",
                mobile: "",
                message: ""
            })
            setCaptchaVerified(false)
            recaptchaRef.current?.reset()
        } catch (error) {
            console.error("Contact form error:", error)
            alert("Failed to submit form. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const phoneConfig = getPhoneConfig()

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar
                session={session}
                onLogout={logout}
                onLoginClick={() => setShowAuthModal(true)}
            />

            <main className="flex-1 container mx-auto px-4 py-12 pt-24">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Contact Us
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have a question or need support? We're here to help!
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    {submitted ? (
                        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
                            <CardContent className="p-12 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
                                <p className="text-lg text-gray-700 mb-6">
                                    Your message has been submitted successfully. We'll get back to you soon!
                                </p>
                                <Button
                                    onClick={() => setSubmitted(false)}
                                    className="bg-red-500 hover:bg-red-600"
                                >
                                    Send Another Message
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Get in Touch</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Name *
                                        </label>
                                        <Input
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleNameChange}
                                            onBlur={() => handleBlur("name")}
                                            placeholder="Enter your full name (letters only)"
                                            className={`w-full transition-all ${errors.name
                                                ? "border-red-500 border-2 bg-red-50 focus:ring-red-500 focus:border-red-500"
                                                : ""
                                                }`}
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <X className="w-3 h-3" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Email *
                                        </label>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleEmailChange}
                                            onBlur={() => handleBlur("email")}
                                            placeholder="your.email@example.com"
                                            className={`w-full transition-all ${errors.email
                                                ? "border-red-500 border-2 bg-red-50 focus:ring-red-500 focus:border-red-500"
                                                : ""
                                                }`}
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <X className="w-3 h-3" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Country Dropdown with Search */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            Country *
                                        </label>
                                        <div className="relative">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input
                                                    ref={countryInputRef}
                                                    type="text"
                                                    value={formData.country ? formData.country : countrySearch}
                                                    onChange={(e) => {
                                                        setCountrySearch(e.target.value)
                                                        if (formData.country) {
                                                            setFormData(prev => ({ ...prev, country: "" }))
                                                        }
                                                    }}
                                                    onFocus={() => setShowCountryDropdown(true)}
                                                    placeholder="Search and select your country..."
                                                    className={`w-full pl-10 pr-8 transition-all ${errors.country
                                                        ? "border-red-500 border-2 bg-red-50 focus:ring-red-500 focus:border-red-500"
                                                        : ""
                                                        }`}
                                                />
                                                {formData.country && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, country: "", mobile: "" }))
                                                            setCountrySearch("")
                                                            countryInputRef.current?.focus()
                                                        }}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Dropdown List */}
                                            {showCountryDropdown && !formData.country && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                                                    {filteredCountries.length === 0 ? (
                                                        <div className="px-4 py-3 text-gray-500 text-sm">
                                                            No country found
                                                        </div>
                                                    ) : (
                                                        filteredCountries.map((country) => (
                                                            <button
                                                                key={country}
                                                                type="button"
                                                                onClick={() => handleCountrySelect(country)}
                                                                className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center justify-between transition-colors"
                                                            >
                                                                <span>{country}</span>
                                                                {COUNTRY_PHONE_CODES[country] && (
                                                                    <span className="text-xs text-gray-500">
                                                                        {COUNTRY_PHONE_CODES[country].code}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {errors.country && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <X className="w-3 h-3" />
                                                {errors.country}
                                            </p>
                                        )}

                                        {/* Click outside to close */}
                                        {showCountryDropdown && !formData.country && (
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowCountryDropdown(false)}
                                            />
                                        )}
                                    </div>

                                    {/* Mobile with Country Code */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            Mobile *
                                        </label>
                                        <div className="flex gap-2">
                                            {phoneConfig.code && (
                                                <div className="flex items-center px-3 border rounded-md bg-gray-50 text-sm font-medium text-gray-700 min-w-[60px] justify-center">
                                                    {phoneConfig.code}
                                                </div>
                                            )}
                                            <Input
                                                name="mobile"
                                                type="tel"
                                                value={formData.mobile}
                                                onChange={handleMobileChange}
                                                onBlur={() => handleBlur("mobile")}
                                                placeholder={phoneConfig.code ? `Enter ${phoneConfig.digits} digits` : "Enter mobile number"}
                                                className={`flex-1 transition-all ${errors.mobile
                                                    ? "border-red-500 border-2 bg-red-50 focus:ring-red-500 focus:border-red-500"
                                                    : ""
                                                    }`}
                                            />
                                        </div>
                                        {errors.mobile && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <X className="w-3 h-3" />
                                                {errors.mobile}
                                            </p>
                                        )}
                                        {formData.country && phoneConfig.code && !errors.mobile && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formData.country} requires exactly {phoneConfig.digits} digits
                                            </p>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            Message *
                                        </label>
                                        <Textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleMessageChange}
                                            onBlur={() => handleBlur("message")}
                                            placeholder="How can we help you?"
                                            className={`w-full min-h-[120px] transition-all ${errors.message
                                                ? "border-red-500 border-2 bg-red-50 focus:ring-red-500 focus:border-red-500"
                                                : ""
                                                }`}
                                            maxLength={200}
                                        />
                                        <div className="text-xs text-gray-500 text-right mt-1">
                                            {formData.message.length}/200
                                        </div>
                                        {errors.message && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                <X className="w-3 h-3" />
                                                {errors.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* reCAPTCHA */}
                                    <div className="flex justify-center">
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                                            onChange={handleCaptchaChange}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={!captchaVerified || submitting}
                                        className="w-full bg-red-500 hover:bg-red-600 text-white py-3 text-lg font-semibold disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Message"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}


                </div>
            </main>

            <Footer />

            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => {
                        setShowAuthModal(false)
                        window.location.reload()
                    }}
                />
            )}
        </div>
    )
}
