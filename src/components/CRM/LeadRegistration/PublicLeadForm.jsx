import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import logo from "../../../assets/lead_generation.jpg";

/**
 * Public Lead Generation Form Component
 * Captures leads from public website and saves to CRM system
 */
const PublicLeadForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    profession: [], // Multiple selection
    businessName: "",
    location: "",
    socialLink: "",
    deliveryAddress: "",
    okayToCall: "",
    phone: "",
    email: ""
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Profession options matching your form
  const professionOptions = [
    { id: "wedding-planner", label: "Wedding Planner" },
    { id: "invitation-designer", label: "Invitation Designer" },
    { id: "calligrapher", label: "Calligrapher" },
    { id: "stationery-shop", label: "Stationery Shop" },
    { id: "artist-illustrator", label: "Artist or Illustrator" },
    { id: "creative-studio", label: "Creative Studio" }
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle profession checkbox changes
  const handleProfessionChange = (professionId) => {
    setFormData(prev => ({
      ...prev,
      profession: prev.profession.includes(professionId)
        ? prev.profession.filter(id => id !== professionId)
        : [...prev.profession, professionId]
    }));
    
    if (errors.profession) {
      setErrors(prev => ({
        ...prev,
        profession: null
      }));
    }
  };

  // Handle radio button changes
  const handleRadioChange = (value) => {
    setFormData(prev => ({
      ...prev,
      okayToCall: value
    }));
    
    if (errors.okayToCall) {
      setErrors(prev => ({
        ...prev,
        okayToCall: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.profession.length === 0) {
      newErrors.profession = "Please select at least one profession";
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business/brand name is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.socialLink.trim()) {
      newErrors.socialLink = "Instagram or website link is required";
    }

    if (!formData.okayToCall) {
      newErrors.okayToCall = "Please let us know if we can call you";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare lead data for CRM system
      const leadData = {
        // Basic info mapping to your CRM structure
        name: formData.name.trim(),
        company: formData.businessName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        
        // Set source as website since this is a public form
        source: "website",
        
        // Default status for new public leads
        status: "newLead",
        
        // Job type based on profession (use first selected profession)
        jobType: formData.profession.length > 0 ? "stationery" : null,
        
        // Budget and urgency defaults
        budget: null,
        urgency: null,
        
        // Custom fields specific to this form stored in notes
        profession: formData.profession,
        socialLink: formData.socialLink.trim(),
        okayToCall: formData.okayToCall === "yes",
        
        // Address information
        address: {
          line1: formData.deliveryAddress.trim(),
          line2: "",
          city: formData.location.trim(),
          state: "",
          postalCode: "",
          country: "India"
        },
        
        // Additional notes combining form responses
        notes: `Lead Source: Public Website Form - Sample Kit Request

Profession(s): ${formData.profession.map(id => 
          professionOptions.find(opt => opt.id === id)?.label
        ).join(", ")}

Social/Website: ${formData.socialLink}

Okay to call: ${formData.okayToCall === "yes" ? "Yes" : "No"}

${formData.deliveryAddress ? `Delivery Address: ${formData.deliveryAddress}` : "No delivery address provided"}

Form filled on: ${new Date().toLocaleDateString("en-IN")}`,
        
        // Default badge ID (you can set this to a specific badge for website leads)
        badgeId: null,
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Order for kanban (set to high number so it appears at bottom of new leads)
        order: Date.now()
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, "leads"), leadData);
      
      console.log("Lead saved successfully with ID:", docRef.id);
      
      setIsSubmitted(true);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      name: "",
      profession: [],
      businessName: "",
      location: "",
      socialLink: "",
      deliveryAddress: "",
      okayToCall: "",
      phone: "",
      email: ""
    });
    setErrors({});
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thank You for Your Interest!
              </h2>
              
              <p className="text-gray-600 mb-6">
                We've received your request for our sample kit. Our team will review your information and get back to you soon!
              </p>
              
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-pink-800">
                  <span className="font-medium">📮 Note:</span> We only have 50 kits available right now. 
                  We're sending them to people who feel like the right fit for what we do. 
                  If you don't get a kit this time, don't worry – we'll still keep in touch!
                </p>
              </div>
              
              <button
                onClick={resetForm}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Side - Image */}
            <div className="order-2 lg:order-1">
              <div className="bg-gray-200 rounded-2xl aspect-square flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <img src={logo} alt="Famous Logo"/>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  WOULD YOU LIKE A LITTLE BOX OF OUR FAVOURITE PAPER THINGS?
                </h1>
                
                <p className="text-gray-600 mb-8">
                  We'd love to know who we're talking to.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Question 1: Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      1. What's your name? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="(So we know what to write on the envelope)"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  {/* Question 2: Profession */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      2. What do you do?
                    </label>
                    <div className="space-y-2">
                      {professionOptions.map((option) => (
                        <label key={option.id} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.profession.includes(option.id)}
                            onChange={() => handleProfessionChange(option.id)}
                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                            disabled={isSubmitting}
                          />
                          <span className="ml-3 text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.profession && <p className="mt-1 text-sm text-red-500">{errors.profession}</p>}
                  </div>

                  {/* Question 3: Business Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      3. What's your business or brand name? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="If you have one. If not, just say 'still dreaming!'"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                        errors.businessName ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.businessName && <p className="mt-1 text-sm text-red-500">{errors.businessName}</p>}
                  </div>

                  {/* Question 4: Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      4. Where are you based? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City + Country please!"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                        errors.location ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
                  </div>

                  {/* Question 5: Social Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      5. Share your Instagram or website link <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="socialLink"
                      value={formData.socialLink}
                      onChange={handleInputChange}
                      placeholder="We'd love to peek at your work."
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                        errors.socialLink ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.socialLink && <p className="mt-1 text-sm text-red-500">{errors.socialLink}</p>}
                  </div>

                  {/* Question 9: Delivery Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      9. Where should we send your kit (if selected)?
                    </label>
                    <textarea
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      placeholder="Name, Full Address, Pincode, Phone Number"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Question 10: Okay to Call */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      10. Are you okay with us calling you for a quick chat before we send it out? <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="okayToCall"
                          value="yes"
                          checked={formData.okayToCall === "yes"}
                          onChange={() => handleRadioChange("yes")}
                          className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                          disabled={isSubmitting}
                        />
                        <span className="ml-3 text-gray-700">Yes please!</span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="okayToCall"
                          value="no"
                          checked={formData.okayToCall === "no"}
                          onChange={() => handleRadioChange("no")}
                          className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                          disabled={isSubmitting}
                        />
                        <span className="ml-3 text-gray-700">Prefer not to</span>
                      </label>
                    </div>
                    {errors.okayToCall && <p className="mt-1 text-sm text-red-500">{errors.okayToCall}</p>}
                  </div>

                  {/* Question 11: Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      11. What's your mobile number?
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(if you're okay with us calling you)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Question 12: Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      12. What's your email address? <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="(So we can keep in touch. We promise no spam)"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    {errors.submit && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-sm text-red-700">{errors.submit}</p>
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-colors ${
                        isSubmitting 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending your request...
                        </div>
                      ) : (
                        "SEND MY REQUEST"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLeadForm;