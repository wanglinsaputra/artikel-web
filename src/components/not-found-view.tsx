"use client";

import { ArrowLeft, Home } from "lucide-react";
import { FuzzyText } from "@/components/ui/fuzzy-text";
import { Button, ButtonLink, Container } from "@/components/ui";

export function NotFoundView() {
  return (
    <Container className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center py-16 md:py-20">
      {/* soft accent wash — design tokens only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-elevated/80 blur-2xl" />
      </div>

      <section
        className="relative z-10 flex w-full max-w-xl flex-col items-center text-center"
        aria-labelledby="not-found-heading"
      >
        <div className="flex justify-center" aria-hidden>
          <FuzzyText
            fontSize="clamp(4.5rem, 18vw, 7rem)"
            fontWeight={700}
            color="#F5F5F7"
            baseIntensity={0.12}
            hoverIntensity={0.35}
            fuzzRange={24}
            enableHover
            aria-label="404"
          >
            404
          </FuzzyText>
        </div>

        <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.2em] text-accent">
          Halaman hilang
        </p>

        <h1
          id="not-found-heading"
          className="mt-3 text-[28px] font-bold leading-tight tracking-tight text-primary sm:text-[32px]"
        >
          Ups, halaman ini tidak ada.
        </h1>

        <p className="mt-3 max-w-md text-base text-secondary">
          URL mungkin salah, atau konten sudah dipindah. Coba kembali ke beranda
          atau halaman sebelumnya.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/" className="min-h-11 gap-2">
            <Home className="h-[18px] w-[18px] shrink-0" aria-hidden />
            Kembali ke Beranda
          </ButtonLink>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11 gap-2"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
                return;
              }
              window.location.href = "/";
            }}
            aria-label="Kembali ke halaman sebelumnya"
          >
            <ArrowLeft className="h-[18px] w-[18px] shrink-0" aria-hidden />
            Kembali
          </Button>
        </div>
      </section>
    </Container>
  );
}
