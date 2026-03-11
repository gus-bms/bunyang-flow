import { Global, Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";

/**
 * Redis가 없는 환경에서도 동작하는 메모리 캐시 기반.
 * REDIS_HOST 환경변수 설정 시 Redis로 업그레이드 가능.
 */
@Global()
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5분 기본 TTL
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
