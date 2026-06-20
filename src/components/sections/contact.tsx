import { useState } from "react";
import { Mail, Phone, CreditCard, Globe, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const channels = [
  { icon: Mail, label: "Email", value: "feminina08@gmail.com", href: "mailto:feminina08@gmail.com" },
  { icon: Phone, label: "MTN Mobile Money", value: "651 645 025", href: "tel:+237651645025" },
  { icon: Phone, label: "Orange Money", value: "697 693 595", href: "tel:+237697693595" },
  { icon: CreditCard, label: "CinetPay", value: "Carte / Mobile Money sécurisé", href: undefined },
  { icon: Globe, label: "Diaspora", value: "PayPal · Visa · Mastercard", href: undefined },
];

export function Contact() {
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Tous les champs sont requis");
      return;
    }
    setSending(true);
    const subject = encodeURIComponent("Contact — Le Léopard et les Ombres");
    const body = encodeURIComponent(`De: ${name} <${email}>\n\n${message}`);
    window.location.href = `mailto:feminina08@gmail.com?subject=${subject}&body=${body}`;
    setSending(false);
  };

  return (
    <section
      id="contact"
      className="relative border-b border-border/40 px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary">
            Contact
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Une question ? Un message à l'auteure ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pour la presse, les libraires, les conférences ou simplement nous écrire.
          </p>

          <div className="mt-8 space-y-3">
            {channels.map((c) => {
              const Icon = c.icon;
              const inner = (
                <Card className="border-border/60 bg-card/50 transition hover:border-primary/40">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        {c.label}
                      </div>
                      <div className="font-medium text-foreground">{c.value}</div>
                    </div>
                  </CardContent>
                </Card>
              );
              return c.href ? (
                <a key={c.label} href={c.href} className="block">
                  {inner}
                </a>
              ) : (
                <div key={c.label}>{inner}</div>
              );
            })}
          </div>
        </div>

        <Card className="border-primary/30 bg-card/70 backdrop-blur">
          <CardContent className="p-6 sm:p-8">
            <h3 className="font-serif text-xl font-semibold">
              Écrivez-nous directement
            </h3>
            <form className="mt-5 space-y-4" onSubmit={onSubmit}>
              <Field>
                <FieldLabel htmlFor="c-name">Votre nom</FieldLabel>
                <Input
                  id="c-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marie K."
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="c-email">Email</FieldLabel>
                <Input
                  id="c-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@email.com"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="c-message">Message</FieldLabel>
                <Textarea
                  id="c-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bonjour..."
                />
              </Field>
              <Button type="submit" disabled={sending} className="w-full">
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Envoyer le message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
