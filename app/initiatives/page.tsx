import InitiativesShowcase from "@/components/initiatives-showcase";

export default function InitiativesPage() {
  return (
    <InitiativesShowcase
      id="initiatives-page"
      variant="page"
      showCategoryFilter
      maxOtherInitial={8}
    />
  );
}
