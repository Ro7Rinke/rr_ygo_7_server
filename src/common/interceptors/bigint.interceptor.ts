import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => this.transform(data)),
    );
  }

  private transform(value: any): any {
    if (typeof value === 'bigint') {
      return value.toString();
    }

    if (Array.isArray(value)) {
      return value.map((v) => this.transform(v));
    }

    if (value && typeof value === 'object') {
      const newObj: any = {};
      for (const key of Object.keys(value)) {
        newObj[key] = this.transform(value[key]);
      }
      return newObj;
    }

    return value;
  }
}