import axios, {
    type AxiosRequestConfig
} from 'axios';
import * as vscode from 'vscode';
import type {
    ComplianceSummary,
    DependencyRefreshResponse,
    JobSummary,
    PipelineRecord,
    RenovateEvaluation,
    RepositoryDetail,
    RepositorySummary,
    SecurityScanJobResponse
} from '../models/platform';
import { ConfigurationService } from './configurationService';

export class BackendApiClient {
    constructor(
        private readonly outputChannel: vscode.OutputChannel
    ) {}

    async listRepositories(): Promise<RepositorySummary[]> {
        const response =
            await this.request<{
                repositories: RepositorySummary[];
            }>({
                method: 'GET',
                url: '/repositories'
            });

        return response.repositories;
    }

    async registerRepository(
        repoUrl: string
    ): Promise<RepositorySummary> {
        const response =
            await this.request<{
                repository: RepositorySummary;
            }>({
                method: 'POST',
                url: '/repositories',
                data: {
                    repoUrl
                }
            });

        return response.repository;
    }

    async getRepository(
        repositoryId: string
    ): Promise<RepositoryDetail> {
        const response =
            await this.request<{
                repository: RepositoryDetail;
            }>({
                method: 'GET',
                url: `/repositories/${repositoryId}`
            });

        return response.repository;
    }

    async runSecurityScan(
        repositoryId: string
    ): Promise<SecurityScanJobResponse> {
        return this.request<SecurityScanJobResponse>({
            method: 'POST',
            url: `/security/${repositoryId}/run`
        });
    }

    async refreshDependencies(
        repositoryId: string
    ): Promise<DependencyRefreshResponse> {
        return this.request<DependencyRefreshResponse>({
            method: 'POST',
            url: `/dependencies/${repositoryId}/check`
        });
    }

    async getComplianceSummary(): Promise<ComplianceSummary> {
        return this.request<ComplianceSummary>({
            method: 'GET',
            url: '/governance/summary'
        });
    }

    async getJobs(): Promise<JobSummary[]> {
        const response =
            await this.request<{
                jobs: JobSummary[];
            }>({
                method: 'GET',
                url: '/jobs'
            });

        return response.jobs;
    }

    async getLatestPipeline(
        repositoryId: string
    ): Promise<PipelineRecord | null> {
        try {
            const response =
                await this.request<{
                    pipeline: PipelineRecord;
                }>({
                    method: 'GET',
                    url: `/pipelines/${repositoryId}/latest`
                });

            return response.pipeline;
        } catch (error) {
            if (
                axios.isAxiosError(error) &&
                error.response?.status === 404
            ) {
                return null;
            }

            throw error;
        }
    }

    async generatePipeline(
        repositoryId: string
    ): Promise<PipelineRecord> {
        const response =
            await this.request<{
                pipeline: PipelineRecord;
            }>({
                method: 'POST',
                url: `/pipelines/${repositoryId}/generate`
            });

        return response.pipeline;
    }

    async getRenovateGovernance(): Promise<RenovateEvaluation[]> {
        const response =
            await this.request<{
                evaluations: RenovateEvaluation[];
            }>({
                method: 'GET',
                url: '/governance/renovate'
            });

        return response.evaluations;
    }

    async getRenovateGovernanceForRepository(
        repositoryId: string
    ): Promise<RenovateEvaluation[]> {
        const response =
            await this.request<{
                evaluations: RenovateEvaluation[];
            }>({
                method: 'GET',
                url: `/governance/renovate?repositoryId=${encodeURIComponent(repositoryId)}`
            });

        return response.evaluations;
    }

    async getRepositoryGovernance(
        repositoryId: string
    ): Promise<RepositoryDetail> {
        const response =
            await this.request<RepositoryDetail>({
                method: 'GET',
                url: `/governance/repository/${repositoryId}`
            });

        return response;
    }

    async getRepositoryDependencyUpdates(
        repositoryId: string
    ): Promise<any[]> {
        const response =
            await this.request<{
                repositoryId: string;
                dependencyUpdates: any[];
            }>({
                method: 'GET',
                url: `/dependencies/repository/${repositoryId}`
            });

        return response.dependencyUpdates;
    }

    getBackendUrl(): string {
        return ConfigurationService.getBackendUrl();
    }

    private async request<T>(
        config: AxiosRequestConfig
    ): Promise<T> {
        const baseURL =
            this.getBackendUrl();

        this.outputChannel.appendLine(
            `Backend request: ${config.method ?? 'GET'} ${baseURL}${config.url ?? ''}`
        );

        const response =
            await axios.request<T>({
                ...config,
                baseURL,
                timeout: 15000
            });

        return response.data;
    }
}
