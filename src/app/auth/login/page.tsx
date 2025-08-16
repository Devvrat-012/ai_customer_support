import { LoginForm } from '@/components/auth/LoginForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { gradients, animations, spacing } from '@/lib/design-system';

export default function LoginPage() {
  return (
    <AppLayout variant="auth">
      <div className={`min-h-screen ${gradients.auth} flex items-center justify-center relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className={`absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 ${animations.blob}`}></div>
        <div className={`absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 ${animations.blob} ${animations.delayShort}`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 ${animations.blob} ${animations.delayLong}`}></div>
        
        <div className={`${spacing.container} relative z-10`}>
          <LoginForm />
        </div>
      </div>
    </AppLayout>
  );
}
