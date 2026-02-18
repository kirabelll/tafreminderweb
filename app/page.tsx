import DriverLicenseForm from "../components/driver-license-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            TAF Reminder
          </h1>
          <p className="text-muted-foreground">
            Driver License Information System
          </p>
        </div>
        
        <DriverLicenseForm />
      </main>
    </div>
  );
}
