import Head from "next/head";

export function ServiceSchema({ serviceType, description, location }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: serviceType,
    description: description,
    provider: {
      "@type": "Organization",
      name: "Labro",
      url: "https://labro.app",
    },
    areaServed: location || "India",
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: "https://labro.app/find",
      serviceSmsNumber: "+91-XXXXXXXXXX",
    },
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />
    </Head>
  );
}

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Labro",
    description:
      "Local services platform connecting customers with skilled workers",
    url: "https://labro.app",
    sameAs: [
      "https://www.facebook.com/profile.php?id=61572705791291",
      "https://x.com/labroapp",
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    openingHours: "Mo-Su 00:00-23:59",
    priceRange: "₹",
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />
    </Head>
  );
}
