"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { InitiativeFull } from "@/lib/initiatives-types";
import { getInitiativeFullAdmin } from "@/lib/initiatives-services";
import { InitiativeEditor } from "@/components/admin/initiative-editor";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function EditInitiativePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [initiative, setInitiative] = useState<InitiativeFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInitiativeFullAdmin(id)
      .then((res) => setInitiative(res))
      .catch((err) => console.warn("Failed loading initiative:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-primary-blue-light/60">
        <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-accent-blue" />
        Loading initiative editor...
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="bg-white rounded-3xl border border-surface-blue-dark p-12 text-center max-w-xl mx-auto space-y-3">
        <h2 className="font-serif text-2xl font-bold text-primary-blue">
          Initiative Not Found
        </h2>
        <Link
          href="/admin/initiatives"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-accent-blue hover:underline"
        >
          <ArrowLeft size={14} /> Back to Initiatives
        </Link>
      </div>
    );
  }

  return <InitiativeEditor initialData={initiative} />;
}
