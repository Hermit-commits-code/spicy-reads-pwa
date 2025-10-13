import React, { useRef } from 'react';
import {
  FormControl,
  FormLabel,
  Button,
  Image,
  HStack,
} from '@chakra-ui/react';

export default function CoverUploadField({
  t,
  cover,
  setCover,
  idPrefix = '',
}) {
  const inputId = `${idPrefix}-cover-upload-input`;
  const inputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCover(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <FormControl>
      <FormLabel htmlFor={inputId}>{t('cover')}</FormLabel>
      <HStack>
        <input
          id={inputId}
          name={inputId}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={inputRef}
          onChange={handleFileChange}
        />
        <Button
          onClick={() => inputRef.current.click()}
          aria-label={t('upload_cover')}
        >
          {t('upload_cover')}
        </Button>
        {cover && (
          <Image
            src={cover}
            alt={t('cover_preview')}
            boxSize="40px"
            objectFit="cover"
            borderRadius="md"
          />
        )}
      </HStack>
    </FormControl>
  );
}
