import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

interface ContactBody {
  nombre: string;
  email: string;
  categoria: string;
  mensaje: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body: ContactBody = await request.json();

    const { nombre, email, categoria, mensaje } = body;

    const errors: string[] = [];
    if (!nombre?.trim()) errors.push('nombre');
    if (!email?.trim()) errors.push('email');
    if (!categoria?.trim()) errors.push('categoria');
    if (!mensaje?.trim()) errors.push('mensaje');

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ ok: false, error: `Campos requeridos: ${errors.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Email inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const RESEND_API_KEY = locals.runtime?.env?.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Error de configuración del servidor' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    const categoriaLabels: Record<string, string> = {
      empresas: 'Empresas',
      instituciones: 'Instituciones',
      profesionales: 'Profesionales',
    };
    const categoriaLabel = categoriaLabels[categoria] || categoria;

    const { data, error: resendError } = await resend.emails.send({
      from: 'Nexis Oaxaca <contacto@nexis.oaxaca.com>',
      to: 'nexistechnology@gmail.com',
      subject: `Nuevo contacto - ${categoriaLabel}`,
      html: `
        <h2>Nuevo mensaje desde el formulario de contacto</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr><td style="padding:8px;font-weight:bold">Nombre:</td><td style="padding:8px">${nombre}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px">${email}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Categoría:</td><td style="padding:8px">${categoriaLabel}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Mensaje:</td><td style="padding:8px">${mensaje}</td></tr>
        </table>
      `,
    });

    if (resendError) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Error al enviar el mensaje' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: 'Mensaje enviado correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
