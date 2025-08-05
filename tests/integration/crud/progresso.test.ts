/**
 * Testes CRUD específicos para tabela progresso
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { supabase } from '../../../src/supabase/client';
import { AuthService } from '../../../src/supabase/auth';

describe('CRUD - Tabela progresso', () => {
    const authService = new AuthService();
    let currentUserId: string;
    const testIds: string[] = [];

    beforeAll(async () => {
        console.log('🔐 Fazendo login para testes CRUD progresso...');
        const result = await authService.signIn(
            process.env.TEST_USER_EMAIL || 'exemplo@gmail.com',
            process.env.TEST_USER_PASSWORD || '123456'
        );

        if (!result?.user?.id) {
            throw new Error('Falha no login para testes');
        }

        currentUserId = result.user.id;
        console.log(`✅ Login realizado. User ID: ${currentUserId}`);
    }, 15000);

    afterAll(async () => {
        console.log('🧹 Limpando registros de progresso de teste...');

        if (testIds.length > 0) {
            await supabase.from('progresso').delete().in('id', testIds);
            console.log(`✅ ${testIds.length} registro(s) de progresso removido(s)`);
        }

        try {
            await authService.signOut();
        } catch (error) {
            console.log('ℹ️ Logout: usuário já não estava logado');
        }
    });

    describe('Verificação de Schema', () => {
        it('deve verificar estrutura da tabela progresso', async () => {
            const { data, error } = await supabase
                .from('progresso')
                .select('*')
                .limit(1);

            expect(error).toBeNull();
            console.log('✅ Estrutura progresso verificada');

            if (data && data.length > 0) {
                console.log('📋 Campos progresso:', Object.keys(data[0]));
            }
        });
    });

    describe('Operações CRUD', () => {
        let progressoId: string;

        it('INSERT - deve criar novo registro de progresso', async () => {
            /**
        * Objeto de progresso para inserção.
        * @type {{ usuario_id: string, data: string, horas_estudadas: number }} 
        * - horas_estudadas: integer no schema
        */
            const novoProgresso = {
                usuario_id: currentUserId,
                data: new Date().toISOString().split('T')[0], // Hoje em formato YYYY-MM-DD
                horas_estudadas: 3
            };

            const { data, error } = await supabase
                .from('progresso')
                .insert(novoProgresso)
                .select()
                .single();

            expect(error).toBeNull();
            expect(data).toBeDefined();
            expect(data.usuario_id).toBe(currentUserId);
            expect(data.horas_estudadas).toBe(novoProgresso.horas_estudadas);
            expect(data.data).toBe(novoProgresso.data);

            progressoId = data.id;
            testIds.push(progressoId);

            console.log(`✅ Progresso criado: ID ${progressoId} - ${data.horas_estudadas}h em ${data.data}`);
        });

        it('SELECT - deve buscar registro de progresso criado', async () => {
            const { data, error } = await supabase
                .from('progresso')
                .select('*')
                .eq('id', progressoId)
                .single();

            expect(error).toBeNull();
            expect(data).toBeDefined();
            expect(data.id).toBe(progressoId);
            expect(data.usuario_id).toBe(currentUserId);

            console.log(`✅ Progresso encontrado: ${data.horas_estudadas}h em ${data.data}`);
        });

        it('UPDATE - deve atualizar horas estudadas', async () => {
            const novasHoras = 5; // Valor inteiro

            const { data, error } = await supabase
                .from('progresso')
                .update({ horas_estudadas: novasHoras })
                .eq('id', progressoId)
                .select()
                .single();

            expect(error).toBeNull();
            expect(data).toBeDefined();
            expect(data.horas_estudadas).toBe(novasHoras);

            console.log(`✅ Progresso atualizado: ${data.horas_estudadas}h`);
        });

        it('SELECT com filtros - deve buscar progresso do usuário por data', async () => {
            const hoje = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('progresso')
                .select('*')
                .eq('usuario_id', currentUserId)
                .eq('data', hoje);

            expect(error).toBeNull();
            expect(data).toBeDefined();
            expect(Array.isArray(data)).toBe(true);
            expect(data!.length).toBeGreaterThan(0);

            console.log(`✅ Encontrados ${data!.length} registro(s) de progresso para hoje`);
        });

        it('DELETE - deve excluir registro de progresso', async () => {
            const { error } = await supabase
                .from('progresso')
                .delete()
                .eq('id', progressoId);

            expect(error).toBeNull();

            // Verificar se foi realmente deletado
            const { data, error: selectError } = await supabase
                .from('progresso')
                .select('*')
                .eq('id', progressoId);

            expect(selectError).toBeNull();
            expect(data).toEqual([]);

            // Remover da lista de cleanup
            const index = testIds.indexOf(progressoId);
            if (index > -1) {
                testIds.splice(index, 1);
            }

            console.log(`✅ Progresso deletado: ID ${progressoId}`);
        });
    });

    describe('Operações de Análise de Progresso', () => {
        beforeAll(async () => {
            // Criar dados históricos para análise
            const registrosHistoricos = [
                {
                    usuario_id: currentUserId,
                    data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // -5 dias
                    horas_estudadas: 2
                },
                {
                    usuario_id: currentUserId,
                    data: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // -4 dias
                    horas_estudadas: 2
                },
                {
                    usuario_id: currentUserId,
                    data: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // -3 dias
                    horas_estudadas: 4
                },
                {
                    usuario_id: currentUserId,
                    data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // -2 dias
                    horas_estudadas: 1
                },
                {
                    usuario_id: currentUserId,
                    data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // -1 dia
                    horas_estudadas: 3
                }
            ];

            const { data } = await supabase
                .from('progresso')
                .insert(registrosHistoricos)
                .select();

            if (data) {
                data.forEach(p => testIds.push(p.id));
            }
        });

        it('SELECT agregado - deve calcular total de horas dos últimos 7 dias', async () => {
            const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('progresso')
                .select('horas_estudadas')
                .eq('usuario_id', currentUserId)
                .gte('data', seteDiasAtras);

            expect(error).toBeNull();
            expect(data).toBeDefined();
            expect(Array.isArray(data)).toBe(true);

            const totalHoras = data!.reduce((sum, registro) => sum + registro.horas_estudadas, 0);

            expect(totalHoras).toBeGreaterThan(0);

            console.log(`✅ Total de horas estudadas nos últimos 7 dias: ${totalHoras}h`);
        });

        it('SELECT com ordenação - deve buscar progresso ordenado por data', async () => {
            const { data, error } = await supabase
                .from('progresso')
                .select('*')
                .eq('usuario_id', currentUserId)
                .order('data', { ascending: false })
                .limit(10);

            expect(error).toBeNull();
            expect(data).toBeDefined();
            expect(Array.isArray(data)).toBe(true);
            expect(data!.length).toBeGreaterThan(0);

            // Verificar se está ordenado por data (mais recente primeiro)
            for (let i = 1; i < data!.length; i++) {
                expect(data![i - 1].data >= data![i].data).toBe(true);
            }

            console.log(`✅ Progresso ordenado por data: ${data!.length} registros`);
        });

        it('BULK INSERT - deve registrar progresso de múltiplos dias', async () => {
            const registrosVariados = [
                {
                    usuario_id: currentUserId,
                    data: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +1 dia (futuro)
                    horas_estudadas: 2
                },
                {
                    usuario_id: currentUserId,
                    data: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +2 dias
                    horas_estudadas: 2
                },
                {
                    usuario_id: currentUserId,
                    data: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +3 dias
                    horas_estudadas: 3
                }
            ];

            const { data, error } = await supabase
                .from('progresso')
                .insert(registrosVariados)
                .select();

            expect(error).toBeNull();
            expect(data).toBeDefined();
            expect(data!.length).toBe(3);

            // Verificar valores
            const totalHoras = data!.reduce((sum, p) => sum + p.horas_estudadas, 0);
            expect(totalHoras).toBe(7); // 2 + 2 + 3

            // Adicionar IDs para cleanup
            data!.forEach(p => testIds.push(p.id));

            console.log(`✅ Bulk insert realizado: ${data!.length} registros de progresso criados (total: ${totalHoras}h)`);
        });

        it('UPDATE com condições - deve atualizar progresso de um período específico', async () => {
            const ontem = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // Primeiro, verificar se existe registro para ontem
            const { data: registroExistente } = await supabase
                .from('progresso')
                .select('*')
                .eq('usuario_id', currentUserId)
                .eq('data', ontem)
                .single();

            if (registroExistente) {
                const novasHoras = 6; // Valor inteiro

                const { data, error } = await supabase
                    .from('progresso')
                    .update({ horas_estudadas: novasHoras })
                    .eq('usuario_id', currentUserId)
                    .eq('data', ontem)
                    .select();

                expect(error).toBeNull();
                expect(data).toBeDefined();
                expect(data!.length).toBe(1);
                expect(data![0].horas_estudadas).toBe(novasHoras);

                console.log(`✅ Progresso de ontem atualizado para ${novasHoras}h`);
            } else {
                console.log('ℹ️ Nenhum registro de progresso encontrado para ontem');
            }
        });
    });
});
