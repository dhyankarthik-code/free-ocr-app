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
    "India": { code: "+91", digits: 10 },
    "United States": { code: "+1", digits: 10 },
    "United Kingdom": { code: "+44", digits: 10 },
    "Canada": { code: "+1", digits: 10 },
    "Australia": { code: "+61", digits: 9 },
    "Germany": { code: "+49", digits: 11 },
    "France": { code: "+33", digits: 9 },
    "China": { code: "+86", digits: 11 },
    "Japan": { code: "+81", digits: 10 },
    "Brazil": { code: "+55", digits: 11 },
    "Mexico": { code: "+52", digits: 10 },
    "Italy": { code: "+39", digits: 10 },
    "Spain": { code: "+34", digits: 9 },
    "South Korea": { code: "+82", digits: 10 },
    "Russia": { code: "+7", digits: 10 },
    "Indonesia": { code: "+62", digits: 10 },
    "Pakistan": { code: "+92", digits: 10 },
    "Bangladesh": { code: "+880", digits: 10 },
    "Nigeria": { code: "+234", digits: 10 },
    "Egypt": { code: "+20", digits: 10 },
    "Turkey": { code: "+90", digits: 10 },
    "Philippines": { code: "+63", digits: 10 },
    "Vietnam": { code: "+84", digits: 9 },
    "Thailand": { code: "+66", digits: 9 },
    "South Africa": { code: "+27", digits: 9 },
    "Argentina": { code: "+54", digits: 10 },
    "Poland": { code: "+48", digits: 9 },
    "Ukraine": { code: "+380", digits: 9 },
    "Malaysia": { code: "+60", digits: 9 },
    "Saudi Arabia": { code: "+966", digits: 9 },
    "Netherlands": { code: "+31", digits: 9 },
    "Belgium": { code: "+32", digits: 9 },
    "Sweden": { code: "+46", digits: 9 },
    "Switzerland": { code: "+41", digits: 9 },
    "Norway": { code: "+47", digits: 8 },
    "Austria": { code: "+43", digits: 10 },
    "Denmark": { code: "+45", digits: 8 },
    "Finland": { code: "+358", digits: 9 },
    "Singapore": { code: "+65", digits: 8 },
    "New Zealand": { code: "+64", digits: 9 },
    "Ireland": { code: "+353", digits: 9 },
    "Portugal": { code: "+351", digits: 9 },
    "Greece": { code: "+30", digits: 10 },
    "Israel": { code: "+972", digits: 9 },
    "United Arab Emirates": { code: "+971", digits: 9 },
}

const COUNTRIES = Object.keys(COUNTRY_PHONE_CODES).concat([
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Armenia", "Azerbaijan",
    "Bahamas", "Bahrain", "Barbados", "Belarus", "Belize", "Benin", "Bhutan", "Bolivia",
    "Bosnia and Herzegovina", "Botswana", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cambodia", "Cameroon", "Cape Verde", "Central African Republic", "Chad", "Chile", "Colombia",
    "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Djibouti",
    "Dominica", "Dominican Republic", "Ecuador", "El Salvador", "Equatorial Guinea", "Eritrea",
    "Estonia", "Ethiopia", "Fiji", "Gabon", "Gambia", "Georgia", "Ghana", "Grenada", "Guatemala",
    "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "Iran", "Iraq",
    "Jamaica", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
    "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
    "Malawi", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Micronesia",
    "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
    "Nauru", "Nepal", "Nicaragua", "Niger", "North Korea", "North Macedonia", "Oman", "Palau",
    "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Qatar", "Romania", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
    "Sao Tome and Principe", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Slovakia", "Slovenia",
    "Solomon Islands", "Somalia", "South Sudan", "Sri Lanka", "Sudan", "Suriname", "Syria", "Taiwan",
    "Tajikistan", "Tanzania", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
    "Turkmenistan", "Tuvalu", "Uganda", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela",
    "Yemen", "Zambia", "Zimbabwe"
]).sort()

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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
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

        // Real-time validation - show error immediately if format is invalid
        if (value && !validateEmail(value)) {
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
                    mobile: phoneConfig.code ? `${phoneConfig.code} ${cleanedMobile}` : cleanedMobile,
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

                    {/* Email below form */}
                    <div className="flex items-center justify-center gap-2 text-gray-600 mt-8">
                        <Mail className="w-5 h-5 text-red-500" />
                        <a href="mailto:admin@ocr-extraction.com" className="hover:text-red-500 hover:underline transition-colors font-medium">
                            admin@ocr-extraction.com
                        </a>
                    </div>
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
