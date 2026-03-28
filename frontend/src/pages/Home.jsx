import { Link } from 'react-router-dom';
import { FaPills, FaShippingFast, FaShieldAlt, FaHeadset } from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: <FaPills className="text-4xl text-primary-600" />,
      title: 'Wide Range of Medicines',
      description: 'Access to generic and branded medicines for all your healthcare needs'
    },
    {
      icon: <FaShippingFast className="text-4xl text-primary-600" />,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep'
    },
    {
      icon: <FaShieldAlt className="text-4xl text-primary-600" />,
      title: 'Quality Assured',
      description: 'All medicines are sourced from certified manufacturers'
    },
    {
      icon: <FaHeadset className="text-4xl text-primary-600" />,
      title: '24/7 Support',
      description: 'Our team is always ready to assist you'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to RAJINI PHARMA
          </h1>
          <p className="text-xl mb-2">Generic Common and Surgicals</p>
          <p className="text-lg mb-8 opacity-90">
            Your Trusted Online Pharmacy in Thirukoilur
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/medicines" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Browse Medicines
            </Link>
            <Link to="/register" className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition border-2 border-white">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Pain Relief', 'Antibiotics', 'Diabetes', 'Gastric', 'Allergy', 'Vitamins', 'First Aid', 'Surgical'].map((category, index) => (
              <Link
                key={index}
                to={`/medicines?category=${category}`}
                className="card text-center hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <h3 className="font-semibold text-lg text-primary-700">{category}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need a Prescription Medicine?</h2>
          <p className="text-lg mb-8">Upload your prescription and we'll take care of the rest</p>
          <Link to="/prescriptions" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block">
            Upload Prescription
          </Link>
        </div>
      </section>

      {/* Store Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Visit Our Store</h2>
            <div className="card">
              <p className="text-lg mb-4">
                <strong>RAJINI PHARMA GENERIC COMMON AND SURGICALS</strong>
              </p>
              <p className="text-gray-700 mb-2">
                No. 153/1A1A1, Ground Floor & First Floor
              </p>
              <p className="text-gray-700 mb-2">
                Periyasavalai Main Road, Anna Nagar
              </p>
              <p className="text-gray-700 mb-4">
                Thirukoilur Town, Kallakurichi District - 605757
              </p>
              <p className="text-primary-600 font-semibold">
                Open Daily | Quality Healthcare Products
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

