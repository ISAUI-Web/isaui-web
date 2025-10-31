'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../components/ui/dialog';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!actual || !nueva || !confirmar) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (nueva !== confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (nueva.length < 6) {
      setError('Mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    if (!token) {
      setError('No autenticado');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/usuario/me/cambiar-contrasena`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contrasena_actual: actual,
            nueva_contrasena: nueva,
            confirmar_nueva_contrasena: confirmar,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setSuccess('¡Contraseña cambiada!');
        setTimeout(() => {
          onOpenChange(false);
          setActual('');
          setNueva('');
          setConfirmar('');
        }, 1500);
      } else {
        setError(data.mensaje || 'Error');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu contraseña actual y la nueva.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {success && <p className="text-green-600 text-center">{success}</p>}
          {error && <p className="text-red-600 text-center">{error}</p>}

          <div className="grid gap-2">
            <Label>Contraseña actual</Label>
            <Input
              type="password"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label>Nueva contraseña</Label>
            <Input
              type="password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label>Confirmar</Label>
            <Input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Cambiando...' : 'Cambiar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}