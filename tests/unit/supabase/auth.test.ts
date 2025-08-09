/**
 * Testes unitários para AuthService
 */
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { AuthService } from '../../../src/supabase/auth';

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
    });

    afterEach(() => {
        // Cleanup após cada teste
        jest.clearAllMocks();
    });

    describe('Instância', () => {
        it('deve ter instância válida do AuthService', () => {
            expect(authService).toBeInstanceOf(AuthService);
        });

        it('deve ter todos os métodos públicos disponíveis', () => {
            expect(typeof authService.signIn).toBe('function');
            expect(typeof authService.signUp).toBe('function');
            expect(typeof authService.signOut).toBe('function');
            expect(typeof authService.getCurrentUser).toBe('function');
            expect(typeof authService.isAuthenticated).toBe('function');
            expect(typeof authService.onAuthStateChange).toBe('function');
        });
    });

    describe('Autenticação Real', () => {
        const testEmail = process.env.TEST_USER_EMAIL;
        const testPassword = process.env.TEST_USER_PASSWORD;
        if (!testEmail || !testPassword) {
            throw new Error('Environment variables TEST_USER_EMAIL and TEST_USER_PASSWORD must be set for authentication tests.');
        }
        it('deve fazer login com credenciais válidas', async () => {
            const result = await authService.signIn(testEmail, testPassword);

            expect(result).toBeDefined();
            expect(result.user).toBeDefined();
            expect(result.user?.email).toBe(testEmail);
        }, 10000);

        it('deve falhar com credenciais inválidas', async () => {
            await expect(authService.signIn('invalid@test.com', 'wrongpassword'))
                .rejects
                .toThrow('Erro no login');
        });

        it('deve obter usuário atual após login', async () => {
            // Fazer login primeiro
            await authService.signIn(testEmail, testPassword);

            const user = await authService.getCurrentUser();
            expect(user).toBeDefined();
            expect(user?.email).toBe(testEmail);
            expect(user?.id).toBeDefined();
        });

        it('deve detectar usuário autenticado', async () => {
            // Fazer login primeiro
            await authService.signIn(testEmail, testPassword);

            const isAuth = await authService.isAuthenticated();
            expect(isAuth).toBe(true);
        });

        it('deve fazer logout', async () => {
            // Fazer login primeiro
            await authService.signIn(testEmail, testPassword);

            // Aguardar um pouco para o estado de auth ser atualizado
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verificar que está logado
            let isAuth = await authService.isAuthenticated();
            expect(isAuth).toBe(true);

            // Fazer logout
            await expect(authService.signOut()).resolves.not.toThrow();

            // Aguardar um pouco para o logout ser processado
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verificar que não está mais logado
            isAuth = await authService.isAuthenticated();
            expect(isAuth).toBe(false);
        });

        it('deve retornar null para usuário não autenticado', async () => {
            // Garantir logout primeiro
            await authService.signOut();

            const user = await authService.getCurrentUser();
            expect(user).toBeNull();
        });
    });

    describe('Estado de Autenticação', () => {
        it('deve configurar callback de mudança de estado', () => {
            const callback = jest.fn();
            const subscription = authService.onAuthStateChange(callback);

            expect(subscription).toBeDefined();
            expect(subscription.data).toBeDefined();
            expect(subscription.data.subscription).toBeDefined();
            expect(typeof subscription.data.subscription.unsubscribe).toBe('function');
        });
    });
});
