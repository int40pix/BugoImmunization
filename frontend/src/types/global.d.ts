import { type Config, type RouteParamsWithQueryOverload } from 'ziggy-js';

declare global {
    function route(): {
        current(): string | undefined;
        current(name: string, params?: RouteParamsWithQueryOverload): boolean;
        has(name: string): boolean;
        params: Record<string, any>;
    };
    function route(
        name: string,
        params?: RouteParamsWithQueryOverload | any,
        absolute?: boolean,
        config?: Config,
    ): string;
}

export {};
