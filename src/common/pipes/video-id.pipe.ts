import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class VideoIdPipe implements PipeTransform {
  private static readonly YT_ID_REGEX = /^[\w-]{11}$/;

  transform(value: any, _metadata: ArgumentMetadata) {
    if (typeof value !== 'string') {
      throw new BadRequestException('videoId must be a string');
    }
    if (!VideoIdPipe.YT_ID_REGEX.test(value)) {
      throw new BadRequestException(
        'videoId must be an 11-character YouTube ID (letters, digits, underscore, hyphen)',
      );
    }
    return value;
  }
}
